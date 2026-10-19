export function StartPageView({ model }) {
  return (
    <section className="startpage">
        <div>
          <h3>Today's date</h3>
          <h1>{model.greeting}</h1>
        </div>
        
        <div className="dashboard">
          <div className="dashboard-left">
            <div className="daily-challenge-div">
              <div className="card-title">
                Daily challenge
              </div>
              <h2 className="card-h2">Find three red things on the way home</h2>
              <div className="card-button">
                Let's do it!
              </div>
            </div>
            <div className="interaction-div">
              <h3>What would you like to do?</h3>
              <div className="interaction-cards">
                <div className="interaction-card activity-card">
                  <h4>Activity</h4>
                  <p>Ideas to play together</p>
                </div>
                <div className="interaction-card conversation-topics">
                  <h4>Conversation Topics</h4>
                  <p>Scan the card to start it</p>
                </div>
                <div className="interaction-card use-illustrations">
                  <h4>Use Illustrations</h4>
                  <p>Check with pictures</p>
                </div>
              </div>
            </div>
          </div>
          <div className="dashboard-right">
            <div className="this-week-div">

            </div>
            <div className="todays-entry-div">

            </div>
          </div>
          
        </div>
    </section>
  

  )
}