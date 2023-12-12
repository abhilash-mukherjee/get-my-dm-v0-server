Endpoints:
1. influencer/
    |___:slug/ () -> {name,bio,id, defaultmessage}
    |___login/ (email, password) -> {token}
    |___signup/ (fullName, email, password, bio, defaultMessage) -> {token}
    |___conversations/ (token) -> {conversations: [sorted list of conversations based on lastUpdated]}
    |___conversations/:id (token) -> {messages: [sorted list of messages based on timeStamp]}
    |___me/ (token) -> {name, id, slug}



2. follower/
    |__login/ (email, password) -> {message: loggedIn, token:}
    |__signup/ (fullname, email, password) -> {message: signedUp, token}
    |__conversation/ (token, infId)-> {conversation: [sorted list of messages based on timeStamp]}



3. dm/
    |__send/ (senderId, receiverId, token, content) -> {messgaes: [sorted list of messages]}
        Creates a new convo between inf and follower if convo doesn't exist, then populates it with defaultMessage