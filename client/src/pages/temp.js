        <header className="container">
            <section className="chat-area">
                <section className="head">
                    <div className="user-assist">
                        <div className="profile-pic">
                            {/* <img src="" alt="" /> */}
                        </div>
                        <div className="assist-link">
                            <button>grup</button>
                            <button>chat</button>
                            <button>menu</button>
                        </div>
                    </div>
                    <SearchBar />
                </section>
                <section className="body">
                    <div className="not-connected"></div>
                    <section className="chat-list">
                        <Chat />
                    </section>
                </section>
            </section>
            <section className="message-section">
                {/* the first heading when no chat is going on */}
                <section className="message-area">
                    <div className="message-area-img">
                        {/* <img src="" alt="Message area img" /> */}
                    </div>
                    <div className="message-area-info">
                        <h2>Onogram</h2>
                        <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Accusantium minima ut veritatis aspernatur quos expedita labore delectus maiores accusamus natus illum, velit reiciendis necessitatibus aut. Cum.</p>
                    </div>

                </section>
                {/* the page when a chat is currently on */}
                <section className="active-message-area">
                    <section className="message-area-head">
                        <span className="message-area-chat-img">
                            {/* <img src="" alt="" /> */}
                        </span>
                        <span className="chat-info">
                            <span className="chat-name">MEE 505</span>
                            <span className="last-message group-users">Kolawole, You</span>
                        </span>
                        <SearchBar />
                    </section>
                    <section className="message-area-body">

                    </section>
                    <section className="message-area-foot">
                        <ChatBar />
                    </section>
                </section>
            </section>
        </header>
