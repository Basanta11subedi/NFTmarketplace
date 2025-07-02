;; Title: marketplace-coin/STX Liquidity Pool
;; Traits: Implement SIP-010 (fungible token) for LP tokens

(define-constant marketplace-contract 'ST390VFVZJA4WP7QSZN0RTSGQDAG2P9NPN3X1ATDX.MarketplaceCoin)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-insufficient-balance (err u101))
(define-constant err-insufficient-liquidity (err u102))
(define-constant err-zero-amount (err u103))
(define-constant err-slippage-too-high (err u104))
(define-constant err-deadline-expired (err u105))
(define-constant err-invalid-token (err u106))
(define-constant err-not-authorized (err u107))

;; Fee is 0.3% (30 basis points) - industry standard
(define-constant fee-numerator u3)
(define-constant fee-denominator u1000)

;; Define fungible tokens for LP tokens
(define-fungible-token stx-marketplace-coin-lp)

;; Define data variables
(define-data-var total-stx uint u0)
(define-data-var total-marketplace-coin uint u0)
(define-data-var last-price-cumulative uint u0)
(define-data-var last-block-height uint u0)

;; Helper functions for math calculations

;; Calculate the amount of tokens to be received in a swap
(define-read-only (get-amount-out (amount-in uint) (reserve-in uint) (reserve-out uint))
  (let
    (
      (amount-in-with-fee (* amount-in (- fee-denominator fee-numerator)))
      (numerator (* amount-in-with-fee reserve-out))
      (denominator (+ (* reserve-in fee-denominator) amount-in-with-fee))
    )
    (/ numerator denominator)
  )
)

;; Calculate the amount of tokens needed to be sent for desired output
(define-read-only (get-amount-in (amount-out uint) (reserve-in uint) (reserve-out uint))
  (let
    (
      (numerator (* reserve-in amount-out fee-denominator))
      (denominator (* (- reserve-out amount-out) (- fee-denominator fee-numerator)))
    )
    (+ (/ numerator denominator) u1)
  )
)



;; Calculate the minimum of two numbers
(define-read-only (min (a uint) (b uint))
  (if (<= a b) a b)
)

;; Get current reserves
(define-read-only (get-reserves)
  (ok {
    stx-reserve: (var-get total-stx),
    marketplace-coin-reserve: (var-get total-marketplace-coin)
  })
)

;; Get LP token total supply
(define-read-only (get-lp-token-supply)
  (ok (ft-get-supply stx-marketplace-coin-lp))
)

;; Get user's LP token balance
(define-read-only (get-lp-balance (user principal))
  (ok (ft-get-balance stx-marketplace-coin-lp user))
)

(define-public (add-liquidity 
  (stx-amount uint) 
  (marketplace-coin-amount uint) 
  (min-stx-amount uint) 
  (min-marketplace-coin-amount uint)
  (deadline uint)
  (recipient principal)
)
  (let (
    (stx-reserve (var-get total-stx))
    (marketplace-coin-reserve (var-get total-marketplace-coin))
    (total-liquidity (ft-get-supply stx-marketplace-coin-lp))
  )
  (begin
    ;; Check deadline expiration
    (asserts! (<= stacks-block-height deadline) err-deadline-expired)
    
    ;; Validate input amounts
    (asserts! (and (> stx-amount u0) (> marketplace-coin-amount u0)) err-zero-amount)
    
    (if (is-eq total-liquidity u0)
      ;; Initial liquidity provision
      (let (
        (liquidity-minted (sqrti (* stx-amount marketplace-coin-amount)))
      )
      (begin
        ;; Verify minimum amounts for initial deposit
        (asserts! (and (>= stx-amount min-stx-amount) 
                      (>= marketplace-coin-amount min-marketplace-coin-amount)) 
                  err-slippage-too-high)
        
        ;; Update reserves
        (var-set total-stx stx-amount)
        (var-set total-marketplace-coin marketplace-coin-amount)
        
        ;; Mint LP tokens
        (try! (ft-mint? stx-marketplace-coin-lp liquidity-minted recipient))
        
        ;; Return success with liquidity details
        (ok { 
          liquidity-minted: liquidity-minted, 
          stx-amount: stx-amount, 
          marketplace-coin-amount: marketplace-coin-amount 
        })
      ))
      ;; Subsequent liquidity additions
      (let (
        (stx-optimal (/ (* marketplace-coin-amount stx-reserve) marketplace-coin-reserve))
        (marketplace-coin-optimal (/ (* stx-amount marketplace-coin-reserve) stx-reserve))
        (liquidity-minted 
          (if (<= stx-optimal stx-amount)
            (/ (* stx-optimal total-liquidity) stx-reserve)
            (/ (* marketplace-coin-optimal total-liquidity) marketplace-coin-reserve)
          )
        )
      )
      (begin
        ;; Verify minimum amounts based on optimal ratio
        (asserts! 
          (if (<= stx-optimal stx-amount)
            (>= stx-optimal min-stx-amount)
            (>= marketplace-coin-optimal min-marketplace-coin-amount)
          )
          err-slippage-too-high
        )
        
        ;; Update reserves
        (var-set total-stx 
          (if (<= stx-optimal stx-amount)
            (+ stx-reserve stx-optimal)
            (+ stx-reserve stx-amount)
          )
        )
        (var-set total-marketplace-coin 
          (if (<= stx-optimal stx-amount)
            (+ marketplace-coin-reserve marketplace-coin-amount)
            (+ marketplace-coin-reserve marketplace-coin-optimal)
          )
        )
        
        ;; Transfer tokens from user
        (try! (stx-transfer? stx-amount tx-sender (as-contract tx-sender)))
        (try! (contract-call? marketplace-contract transfer marketplace-coin-amount tx-sender (as-contract tx-sender) none))
        
        ;; Mint LP tokens
        (try! (ft-mint? stx-marketplace-coin-lp liquidity-minted recipient))
        
        ;; Update price tracking
        (var-set last-block-height stacks-block-height)
        
        (ok { 
          liquidity-minted: liquidity-minted,
          stx-amount: (if (<= stx-optimal stx-amount) stx-optimal stx-amount),
          marketplace-coin-amount: (if (<= stx-optimal stx-amount) marketplace-coin-amount marketplace-coin-optimal)
        })
      ))
    )
  )
))

;; Remove liquidity from the pool
(define-public (remove-liquidity
  (liquidity uint)
  (min-stx-amount uint)
  (min-marketplace-coin-amount uint)
  (deadline uint)
  (recipient principal)
)
  (let
    (
      (stx-reserve (var-get total-stx))
      (marketplace-coin-reserve (var-get total-marketplace-coin))
      (total-liquidity (ft-get-supply stx-marketplace-coin-lp))
      (stx-amount (/ (* liquidity stx-reserve) total-liquidity))
      (marketplace-coin-amount (/ (* liquidity marketplace-coin-reserve) total-liquidity))
    )
    
    ;; Check deadline
    (asserts! (<= stacks-block-height deadline) err-deadline-expired)
    
    ;; Check liquidity > 0
    (asserts! (> liquidity u0) err-zero-amount)
    
    ;; Check slippage tolerance
    (asserts! (and (>= stx-amount min-stx-amount) (>= marketplace-coin-amount min-marketplace-coin-amount)) err-slippage-too-high)
    
    ;; Burn LP tokens
    (try! (ft-burn? stx-marketplace-coin-lp liquidity tx-sender))
    
    ;; Update reserves
    (var-set total-stx (- stx-reserve stx-amount))
    (var-set total-marketplace-coin (- marketplace-coin-reserve marketplace-coin-amount))
    
    ;; Transfer tokens to recipient
    (try! (as-contract (stx-transfer? stx-amount tx-sender recipient)))
    (try! (as-contract (contract-call? marketplace-contract transfer marketplace-coin-amount tx-sender recipient none)))
    
    ;; Update last price info
    (var-set last-block-height stacks-block-height)
    
    (ok {
      stx-amount: stx-amount,
      marketplace-coin-amount: marketplace-coin-amount,
      liquidity-burned: liquidity
    })
  )
)

;; Swap STX for marketplace-coin
(define-public (swap-stx-for-marketplace-coin
  (stx-amount uint)
  (min-marketplace-coin-out uint)
  (deadline uint)
  (recipient principal)
)
  (let
    (
      (stx-reserve (var-get total-stx))
      (marketplace-coin-reserve (var-get total-marketplace-coin))
      (marketplace-coin-amount (get-amount-out stx-amount stx-reserve marketplace-coin-reserve))
    )
    
    ;; Check deadline
    (asserts! (<= stacks-block-height deadline) err-deadline-expired)
    
    ;; Check amount > 0
    (asserts! (> stx-amount u0) err-zero-amount)
    
    ;; Check slippage tolerance
    (asserts! (>= marketplace-coin-amount min-marketplace-coin-out) err-slippage-too-high)
    
    ;; Update reserves
    (var-set total-stx (+ stx-reserve stx-amount))
    (var-set total-marketplace-coin (- marketplace-coin-reserve marketplace-coin-amount))
    
    ;; Transfer tokens
    (try! (stx-transfer? stx-amount tx-sender (as-contract tx-sender)))
    (try! (as-contract (contract-call? marketplace-contract transfer marketplace-coin-amount tx-sender recipient none)))
    
    ;; Update price accumulator
    (var-set last-block-height stacks-block-height)
    
    (ok { marketplace-coin-amount: marketplace-coin-amount })
  )
)

;; Swap marketplace-coin for STX
(define-public (swap-marketplace-coin-for-stx
  (marketplace-coin-amount uint)
  (min-stx-out uint)
  (deadline uint)
  (recipient principal)
)
  (let
    (
      (stx-reserve (var-get total-stx))
      (marketplace-coin-reserve (var-get total-marketplace-coin))
      (stx-amount (get-amount-out marketplace-coin-amount marketplace-coin-reserve stx-reserve))
    )
    
    ;; Check deadline
    (asserts! (<= stacks-block-height deadline) err-deadline-expired)
    
    ;; Check amount > 0
    (asserts! (> marketplace-coin-amount u0) err-zero-amount)
    
    ;; Check slippage tolerance
    (asserts! (>= stx-amount min-stx-out) err-slippage-too-high)
    
    ;; Update reserves
    (var-set total-stx (- stx-reserve stx-amount))
    (var-set total-marketplace-coin (+ marketplace-coin-reserve marketplace-coin-amount))
    
    ;; Transfer tokens
    (try! (contract-call? marketplace-contract transfer marketplace-coin-amount tx-sender (as-contract tx-sender) none))
    (try! (as-contract (stx-transfer? stx-amount tx-sender recipient)))
    
    ;; Update price accumulator
    (var-set last-block-height stacks-block-height)
    
    (ok { stx-amount: stx-amount })
  )
)

;; Initialize the pool
(define-public (initialize-pool)
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set last-block-height stacks-block-height)
    (ok true)
  )
)