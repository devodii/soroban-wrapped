import './Footer.scss'

export function Footer() {
  return (
    <footer className="sw-footer">
      <p>
        Built from the public Stellar ledger archive, summarised on GitHub Actions every six hours.
        Contract state comes from the Soroban RPC.
      </p>
      <p className="sw-footer-small">
        Counts are calls recorded in diagnostic events. Contracts are shown by id, not by name.
      </p>
    </footer>
  )
}
