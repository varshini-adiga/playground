let _userName = "";
let _widgetData = {
    userName: "",
    message: ""
};

window.onload = function() {
    setTimeout(async () => {
        updateIframeHeight();
        const userProfile = await Adobe.getUserProfile();
        if (userProfile && userProfile.userName) {
            _userName = userProfile.userName;
        }

        const widgetData = await Adobe.getWidgetData();
        dataUpdated(widgetData);
        Adobe.subscribeToWidgetData(dataUpdated);
    }, 200);
};

function updateIframeHeight() {
    const expectedHeight = window.document.getElementsByTagName("html")[0].getBoundingClientRect().height;
    if (expectedHeight > 0) {
        Adobe.updateWidgetSize({
            height: expectedHeight
        });
    }
}

function dataUpdated(widgetData) {
    _widgetData = {
        ...widgetData
    };
    if (widgetData && widgetData.userName && widgetData.message) {
        let msgContainer = document.getElementById("messages");
        let el = document.createElement("div");
        el.setAttribute("class", "message");
        el.innerHTML = `<div>
                    <div class="name">${widgetData.userName}</div>
                    <div class="text">${widgetData.message}</div>
                </div>`;
        msgContainer.appendChild(el);
        msgContainer.scrollTop = msgContainer.scrollHeight - msgContainer.clientHeight;
    }
}

function sendMessage() {
    let message = document.getElementById("message-input").value;
    if (message.length == 0) {
        return;
    }
    _widgetData.userName = _userName;
    _widgetData.message = message;
    Adobe.setWidgetData(_widgetData);
    document.getElementById("message-input").value = "";
}