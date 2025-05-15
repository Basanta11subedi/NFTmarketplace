;; SimpleNFT - A basic NF contract for stacks blockchain
;; implements sip-009 nft standard
;; clarity version- 3

(impl-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.nft-trait.nft-trait)

;; errors
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-NOT-FOUND (err u101))


;; Data variables
(define-data-var last-token-id uint u0)
(define-data-var metadata-frozen bool  false)
(define-data-var contract-owner  principal tx-sender)

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
    (match (map-get? token-uris token-id) uri 
    (ok (some uri))
    (ok none))
)

;; get the owner of the specified token
(define-read-only (get-owner (token-id uint))
    (ok (map-get? token-owners token-id))
)

;;public functions
;; mint nft
(define-public (mint (recipient principal) (metadata-uri (string-ascii 256))) 
    (let 
        (
            (token-id (+ (var-get last-token-id) u1))
        )
        ;; update last token id
        (var-set last-token-id token-id)

        ;;set token towner
        (map-set token-owners token-id recipient)

        ;;set token-uri
        (map-set token-uris token-id metadata-uri)

        ;;return token id
        (ok token-id)
    )        
)

;; token transfer funtion
(define-public (transfer (token-id uint) (sender principal) (reciepint principal))
    (begin 
        ;;verify sender is the owner
        (asserts! (is-eq sender tx-sender) ERR-NOT-AUTHORIZED)

        ;;verify token exists
        (asserts! (is-some (map-get? token-owners token-id)) ERR-NOT-FOUND)

        ;;verify sender ownes the token
        (asserts! (is-eq (some sender) (map-get? token-owners token-id)) ERR-NOT-AUTHORIZED)

        ;;transfer token to recipient
        (map-set token-owners token-id reciepint)

        ;;return success
        (ok true)
    )
)