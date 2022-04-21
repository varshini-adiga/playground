let _showingResults = false;
let _optionIndex = 0;

let _userId = "";
let _widgetData = {
    pollSubject: "",
    pollOptions: [],
    votes: []
};

window.onload = function() {
    setTimeout(async () => {
        updateIframeHeight();
        const userProfile = await Adobe.getUserProfile();
        if (userProfile && userProfile.userId) {
            _userId = userProfile.userId;
        }

        const widgetData = await Adobe.getWidgetData();
        dataUpdated(widgetData);
        Adobe.subscribeToWidgetData(dataUpdated);
    }, 0);
};

function updateIframeHeight() {
    const expectedHeight = window.document
        .getElementsByTagName("html")[0]
        .getBoundingClientRect().height;
    if (expectedHeight > 0) {
        Adobe.updateWidgetSize({
            height: expectedHeight,
            width: 300
        });
    }
}

function dataUpdated(widgetData) {
    _widgetData = {
        ...widgetData
    };
    if (
        widgetData &&
        widgetData.pollSubject &&
        widgetData.pollOptions &&
        widgetData.votes
    ) {
        if (!_showingResults) {
            createPoll();
            stylizePoll();
            showResults();
        }

        const votePercentages = getVotePercentages(
            _widgetData.pollOptions,
            _widgetData.votes
        );
        for (let i = 0; i < _widgetData.pollOptions.length; i++) {
            document.getElementById(
                `option-percent-${i}`
            ).innerHTML = `${votePercentages[i]}%`;
            document
                .getElementById(`option-progress-${i}`)
                .setAttribute("style", `--w: ${votePercentages[i]}`);
        }
    }
}

function addOption() {
    _optionIndex++;

    const optionWrapper = document.getElementById("option-wrapper");
    const optionElement = document.createElement("div");

    const group = document.createElement("div");
    group.setAttribute("class", "group");

    const optionLabel = document.createElement("span");
    optionLabel.innerHTML = `Option ${_optionIndex}`;

    const pollOption = document.createElement("input");
    pollOption.setAttribute("type", "text");
    pollOption.setAttribute("id", `poll-option-${_optionIndex}`);

    group.appendChild(optionLabel);
    group.appendChild(pollOption);

    optionElement.appendChild(group);
    optionWrapper.appendChild(optionElement);
}

function createPoll() {
    document.getElementById("poll-title").innerHTML =
        _widgetData.pollSubject;

    const pollWrapper = document.getElementById("poll-wrapper");

    _widgetData.pollOptions.forEach((_, i) => {
        const checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");
        checkbox.setAttribute("name", "poll");
        checkbox.setAttribute("id", `option-${i}`);

        pollWrapper.appendChild(checkbox);
    });

    const votePercentages = getVotePercentages(
        _widgetData.pollOptions,
        _widgetData.votes
    );

    _widgetData.pollOptions.forEach((pollOption, i) => {
        const label = document.createElement("label");
        label.setAttribute("for", `option-${i}`);

        const row = document.createElement("div");
        row.setAttribute("class", "row");

        const column = document.createElement("div");
        column.setAttribute("class", "column");

        const circle = document.createElement("span");
        circle.setAttribute("class", "circle");

        const text = document.createElement("span");
        text.setAttribute("class", "text");
        text.innerHTML = pollOption.value;

        column.appendChild(circle);
        column.appendChild(text);

        const percent = document.createElement("span");
        percent.setAttribute("id", `option-percent-${i}`);
        percent.setAttribute("class", "percent");
        percent.innerHTML = `${votePercentages[i]}%`;

        row.appendChild(column);
        row.appendChild(percent);

        const progress = document.createElement("div");
        progress.setAttribute("id", `option-progress-${i}`);
        progress.setAttribute("class", "progress");
        progress.setAttribute("style", `--w: ${votePercentages[i]}`);

        label.appendChild(row);
        label.appendChild(progress);

        pollWrapper.appendChild(label);
    });
}

function stylizePoll() {
    const options = document.querySelectorAll("label");
    for (let i = 0; i < options.length; i++) {
        options[i].addEventListener("click", () => {
            for (let j = 0; j < options.length; j++) {
                if (options[j].classList.contains("selected")) {
                    options[j].classList.remove("selected");
                }
            }

            options[i].classList.add("selected");
            for (let k = 0; k < options.length; k++) {
                options[k].classList.add("selectall");
            }

            let forVal = options[i].getAttribute("for");
            let selectInput = document.querySelector("#" + forVal);
            let getAtt = selectInput.getAttribute("type");

            if (getAtt == "checkbox") {
                selectInput.setAttribute("type", "radio");
            } else if (selectInput.checked == true) {
                options[i].classList.remove("selected");
                selectInput.setAttribute("type", "checkbox");
            }

            let selected = [];
            for (let l = 0; l < options.length; l++) {
                if (options[l].classList.contains("selected")) {
                    selected = [...selected, l];
                }
            }

            if (selected.length == 0) {
                for (let m = 0; m < options.length; m++) {
                    options[m].removeAttribute("class");
                }
            }

            if (selected.length > 0) {
                _widgetData.votes = upsertVotes(
                    _widgetData.votes,
                    _userId,
                    selected[0]
                );
            } else {
                _widgetData.votes = upsertVotes(_widgetData.votes, _userId, -1);
            }

            Adobe.setWidgetData(_widgetData);
        });
    }
}

function showResults() {
    _showingResults = true;

    document
        .getElementById("poll-setup")
        .setAttribute("style", "display: none");
    document
        .getElementById("poll-results")
        .setAttribute("style", "display: block");
}

function beginPoll() {
    resetPoll();

    _widgetData.pollSubject = document.getElementById("poll-subject").value;
    if (
        !_widgetData.pollSubject ||
        _widgetData.pollSubject.trim().length === 0
    ) {
        showError("Poll should have a subject.");
        return;
    }

    for (let i = 1; i <= _optionIndex; i++) {
        const id = `poll-option-${i}`;
        const value = document.getElementById(id).value;

        if (value && value.trim().length > 0) {
            _widgetData.pollOptions = [
                ..._widgetData.pollOptions,
                {
                    id,
                    value
                },
            ];
        }
    }

    if (_widgetData.pollOptions.length < 2) {
        showError("Poll should have a minimum of 2 options.");
        return;
    }

    _widgetData.votes = [{
        userId: _userId,
        pollOptionIndex: -1
    }];
    Adobe.setWidgetData(_widgetData);
}

function upsertVotes(votes, userId, pollOptionIndex) {
    const index = votes.findIndex((vote) => vote.userId === userId);
    if (index > -1) {
        return votes.map((vote, i) =>
            i === index ? {
                ...vote,
                pollOptionIndex
            } : vote
        );
    } else {
        return [...votes, {
            userId,
            pollOptionIndex
        }];
    }
}

function getVotePercentages(pollOptions, pollVotes) {
    const votes = [];
    const votePercentages = [];
    for (let i = 0; i < pollOptions.length; i++) {
        votes.push(0);
        votePercentages.push(0);
    }

    let voters = 0;
    pollVotes.forEach((vote) => {
        if (vote.pollOptionIndex > -1) {
            votes[vote.pollOptionIndex]++;
            voters++;
        }
    });

    if (voters === 0) {
        return votePercentages;
    }

    for (let i = 0; i < votes.length; i++) {
        votePercentages[i] = Math.round((votes[i] / voters) * 100);
    }

    return votePercentages;
}

function resetPoll() {
    _widgetData.pollSubject = "";
    _widgetData.pollOptions = [];

    const error = document.getElementById("error");
    error.setAttribute("style", "display: none");
    error.innerHTML = "";

    document.getElementById("poll-title").innerHTML = "";
    document.getElementById("poll-wrapper").innerHTML = "";
}

function showError(message) {
    const error = document.getElementById("error");
    error.setAttribute("style", "display: block");
    error.innerHTML = `* ${message}`;
}