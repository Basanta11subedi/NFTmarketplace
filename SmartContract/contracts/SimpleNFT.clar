;; SimpleNFT - A basic NF contract for stacks blockchain
;; implements sip-009 nft standard
;; clarity version- 3

(impl-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.nft-trait.nft-trait)

;; errors
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-NOT-FOUND (err u101))
(define-constant ERR-METADATA-FROZEN (err u102))

;; Data variables
(define-data-var last-token-id uint u0)
(define-data-var metadata-frozen bool  false)

;; nft metadata mapping
(define-map token-uris uint (string-ascii 256))

;;token ownership
(define-map token-owners uint principal)

;;SIP-009 functions
;; read only functions
;;get the last token id
(define-read-only (get-last-token-id)
    (ok (var-get last-token-id))
)

;;get token uri
(define-read-only (get-token-uri (token-id uint))
    (ok (map-get? token-uris token-id))
)

;; get the owner of the specified token
(define-read-only (get-owner (token-id uint))
    (ok (map-get? token-owners token-id))
)

;;get total supply
(define-read-only (get-total-supply)
  (ok (var-get last-token-id))
)

;;public functions

;; mint nft
(define-public (mint (metadata-uri (string-ascii 256)))
  (let (
      (token-id (+ (var-get last-token-id) u1))
      (owner tx-sender)
    )
    (var-set last-token-id token-id)
    (map-set token-owners token-id owner)
    (map-set token-uris token-id metadata-uri)
    (ok token-id)
  )
)

(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq sender tx-sender) ERR-NOT-AUTHORIZED)
    (asserts! (is-some (map-get? token-owners token-id)) ERR-NOT-FOUND)
    (asserts! (is-eq (some sender) (map-get? token-owners token-id)) ERR-NOT-AUTHORIZED)
    
    (ok (map-set token-owners token-id recipient))
    
  )
)


;; Metadata Management Functions
(define-public (set-token-uri (token-id uint) (new-uri (string-ascii 256)))
  (begin
    (asserts! (not (var-get metadata-frozen)) ERR-METADATA-FROZEN)
    (asserts! (is-some (map-get? token-owners token-id)) ERR-NOT-FOUND)
    (asserts! (is-eq (some tx-sender) (map-get? token-owners token-id)) ERR-NOT-AUTHORIZED)
    
    (map-set token-uris token-id new-uri)
    (ok true)
  )
)

(define-public (freeze-metadata)
  (begin
    (asserts! (is-eq tx-sender tx-sender) ERR-NOT-AUTHORIZED) ;; Replace with your owner check if needed
    (var-set metadata-frozen true)
    (ok true)
  )
)