

;; title: Token
;; version:3
;; summary:This is the fungible token for my nft marketplace.
;; description: Anyone who stake their nfts they can earn reward. The reward is the fungible token. 

;; traits
(impl-trait 'ST1NXBK3K5YYMD6FD41MVNP3JS1GABZ8TRVX023PT.sip-010-trait-ft-standard.sip-010-trait)


;; token definitions
(define-fungible-token marketplace-coin u10000000000)
;;

;;Variables
(define-data-var  contract-owner principal tx-sender)

;;constants
(define-constant err-not-token-owner (err u101))
(define-constant err-owner-only (err u100))
(define-constant err-insufficient-amount (err u102))


;; read only functions
(define-read-only (get-name)
    (ok "MarketPlace-coin")
)

(define-read-only (get-symbol)
    (ok "MPC")
)

(define-read-only (get-decimals)
    (ok u6)
)

(define-read-only (get-balance (who principal))
    (ok (ft-get-balance marketplace-coin who))
)

(define-read-only (get-token-uri)
    (ok none)
)

(define-read-only (get-total-supply)
    (ok (ft-get-supply marketplace-coin))
)

;; transfer the tokens
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
    (begin
        (asserts! (is-eq tx-sender sender) err-not-token-owner)
        (try! (ft-transfer? marketplace-coin amount sender recipient))
        (match memo to-print (print to-print) 0x)
        (ok true)  
    )
)

;;Mint the tokens
(define-public (mint (amount uint) (recipient principal))
    (begin
        (asserts! (is-eq tx-sender (var-get contract-owner)) err-owner-only)
        (ft-mint? marketplace-coin amount recipient)
    )
)

;; Burn the tokens
(define-public (burn (amount uint))
    (begin 
        (asserts! (> amount u0) err-insufficient-amount)
        (ft-burn? marketplace-coin amount tx-sender)
    )
)




