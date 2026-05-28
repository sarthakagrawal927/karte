// Mount on the design canvas — desktop deck + mobile deck side by side.

function App() {
  return (
    <DesignCanvas>
      <DCSection
        id="karte"
        title="Karte — landing card decks"
        subtitle="Every section is its own card. Scroll the deck. Issued to humans &amp; their agents."
      >
        <DCArtboard id="onyx-desktop" label="A · Desktop"  width={1280} height={4200}>
          <OnyxLanding />
        </DCArtboard>
        <DCArtboard id="onyx-mobile"  label="B · Mobile"   width={480}  height={4800}>
          <OnyxMobile />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
