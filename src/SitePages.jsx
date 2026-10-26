export function SiteHeader({ foundryStatus, activePage = "workspace" }) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a className="site-brand" href="/" aria-label="Turning Point Finder workspace">
          <img className="site-brand-mark" src="/brand-mark.svg" alt="" width="36" height="36" />
          <span><strong>Turning Point Finder</strong><small>Football match intelligence</small></span>
        </a>
        <nav className="site-nav" aria-label="Main navigation">
          <a href="/" aria-current={activePage === "workspace" ? "page" : undefined}>Workspace</a>
          <a href="/methodology" aria-current={activePage === "methodology" ? "page" : undefined}>Methodology</a>
          <a href="/about" aria-current={activePage === "about" ? "page" : undefined}>About</a>
          <a href="/privacy" aria-current={activePage === "privacy" ? "page" : undefined}>Privacy</a>
        </nav>
        <div className="site-status">
          <span className="synthetic-status">Synthetic data</span>
          {foundryStatus && <span className="foundry-status">{foundryStatus.foundryConfigured ? "Foundry connected" : "Local mode"}</span>}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-main">
        <div><strong>Turning Point Finder</strong><p>Explainable match analysis from synthetic football events.</p></div>
        <nav aria-label="Footer navigation"><a href="/methodology">Methodology</a><a href="/about">About & limitations</a><a href="/privacy">Privacy policy</a><a href="https://github.com/guuly05/MSxPL" target="_blank" rel="noreferrer">Source code / contact</a></nav>
      </div>
      <div className="site-footer-meta"><span>© 2026 Turning Point Finder</span><span>Independent hackathon demo</span><span>Not affiliated with or endorsed by the Premier League.</span></div>
    </footer>
  );
}

function StaticPage({ foundryStatus, activePage, meta, title, intro, children }) {
  return (
    <div className="site-shell">
      <SiteHeader foundryStatus={foundryStatus} activePage={activePage} />
      <main className="static-main">
        <header className="static-heading"><h1>{title}</h1><div><p>{intro}</p>{meta && <p className="static-meta">{meta}</p>}</div></header>
        <div className="prose-content">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}

export function PrivacyPolicyPage() {
  return (
    <StaticPage
      activePage="privacy"
      meta={<time dateTime="2026-10-18">Updated 18 October 2026</time>}
      title="Privacy policy"
      intro="This page explains what Turning Point Finder processes when you use this demonstration application."
    >
      <section><h2>What the app collects</h2><p>The app does not ask you to create an account, enter a name or email address, upload files, or save a profile. Match selections and explanations are held in the browser while you use the page; the app does not save them to a database.</p><p>The demo fixtures and event signals are fictional and bundled with the application.</p></section>
      <section><h2>Temporary request controls</h2><p>The server temporarily uses the network IP address associated with an AI explanation request to enforce a per-minute request limit. These rate-limit records are kept in server memory, are periodically cleared, and are not written to a database by this application.</p></section>
      <section><h2>Optional Microsoft Foundry explanations</h2><p>If Microsoft Foundry is configured, selecting “Generate with Microsoft Foundry” sends the selected fictional match facts, candidate event, evidence, and explanation mode to the configured Azure endpoint. The application does not include user-uploaded match data or profile information in that request. Foundry is not contacted when you only browse or replay a fixture.</p><p>Whether Foundry is configured is controlled by the operator. If it is unavailable, the app provides a deterministic local explanation instead.</p></section>
      <section><h2>Cookies, analytics, and advertising</h2><p>This demo does not set application cookies and does not include analytics or advertising trackers. It uses the application server to provide the page and, when configured, the optional Foundry request.</p></section>
      <section><h2>Changes and contact</h2><p>This policy may be updated if the application’s data handling changes. For questions about this demo, use the project’s <a href="https://github.com/guuly05/MSxPL" target="_blank" rel="noreferrer">GitHub repository</a>.</p></section>
    </StaticPage>
  );
}

export function MethodologyPage() {
  return (
    <StaticPage
      activePage="methodology"
      meta="Version 1"
      title="How the ranking works"
      intro="Turning Point Finder ranks candidate events by observable synthetic match signals. The score is a review aid, not a prediction."
    >
      <section><h2>Candidate events</h2><p>Goals, red cards, penalties, substitutions, and shots can be considered. A high-impact event does not automatically become the leading candidate; the ranking also considers what the match signals show around it.</p></section>
      <section><h2>Evidence window</h2><p>For each candidate, the ranking compares up to three earlier and three later events within a ten-minute window. It uses score changes, the difference between the teams’ synthetic control values, and whether a control shift persists across later events.</p></section>
      <section><h2>Impact index</h2><p>The displayed index is calculated from a baseline, an event-type weight, a score-change bonus, the size of the control shift, and persistence. The result is rounded and capped at 99. The report shows each contribution separately so an analyst can inspect how a candidate ranked.</p><p>Control values are invented for this demo. They are not possession statistics, expected goals, win probability, or verified observations from a real match.</p></section>
      <section><h2>Confidence and uncertainty</h2><p>Confidence depends on the impact index, the number of supporting signals, whether enough events exist on both sides of the candidate, and the gap to the next candidate. Weak evidence is labeled low confidence; the report can also state that there is no clear turning point.</p></section>
      <section><h2>Role of Microsoft Foundry</h2><p>The deterministic rules rank candidates. Foundry is optional and only writes an explanation when explicitly requested. The server gives it structured synthetic evidence and accepts claims only when they refer to supplied evidence identifiers. A local explanation remains available if the model is not configured or its response cannot be grounded.</p></section>
    </StaticPage>
  );
}

export function AboutPage() {
  return (
    <StaticPage
      activePage="about"
      title="About this project"
      intro="Turning Point Finder is a hackathon demonstration of evidence-led football match review."
    >
      <section><h2>What it does</h2><p>The workspace ranks candidate events from a fictional match, explains the signals behind each ranking, and lets an analyst replay the event sequence alongside the report.</p></section>
      <section><h2>What the data means</h2><p>Every fixture, event, scoreline, and control signal in this demo is synthetic. Nothing here represents official Premier League data or a real match.</p></section>
      <section><h2>How AI is used</h2><p>Deterministic rules rank the events. Microsoft Foundry can optionally write a short explanation from the selected synthetic evidence after the user requests it. The model does not determine the ranking.</p></section>
      <section><h2>Limitations</h2><p>The impact index is not a probability, causal finding, betting recommendation, scouting assessment, or professional sporting advice. The small synthetic fixtures cannot establish real-world performance.</p></section>
      <section><h2>Project source</h2><p>This is an independent hackathon project and is not affiliated with or endorsed by the Premier League. Read or contact the maintainer through the <a href="https://github.com/guuly05/MSxPL" target="_blank" rel="noreferrer">public GitHub repository</a>.</p></section>
    </StaticPage>
  );
}
