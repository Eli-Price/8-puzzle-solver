//var game = new Game('203156478');
var game = new Game();
Board.draw(game.state);

var boardDiv = document.getElementById('board');
var randomizeButton = document.getElementById('randomize');
var customInputButton = document.getElementById('customInput');
var searchTypeSelectbox = document.getElementById('searchType');
var iterationLimitInput = document.getElementById('iterationLimit');
var depthLimitInput = document.getElementById('depthLimit');
var searchButton = document.getElementById('search');
var searchStopButton = document.getElementById('searchStop');
var searchStepButton = document.getElementById('searchStep');
var expandedNodeCheckbox = document.getElementById('expandedNodeCheck');
var searchResultDiv = document.getElementById('searchResult');
var visualizationCheckbox = document.getElementById('visualizationCheck');

var searchStepOptions = null;

randomizeButton.addEventListener('click', function() {
    Board.clearReplay();
    game.randomize();
    Board.draw(game.state);
    searchResultDiv.innerHTML = '';
}, false);

customInputButton.addEventListener('click', function() {
    Board.clearReplay();
    game.state = prompt('New game state like: "012345678"');
    Board.draw(game.state);
    searchResultDiv.innerHTML = '';
}, false);

searchButton.addEventListener('click', function() {
    Board.clearReplay();
    searchStepOptions = null;

    var initialNode = new Node({state: game.state});
    var iterationLimit = parseInt(iterationLimitInput.value, 10);
    var depthLimit = parseInt(depthLimitInput.value, 10);

    if (isNaN(iterationLimit))
        return alert('Invalid iteration limit');

    if (isNaN(depthLimit))
        return alert('Invalid depth limit');

    searchResultDiv.innerHTML = '';

    search({
        node: initialNode,
        iterationLimit: iterationLimit,
        depthLimit: depthLimit,
        expandCheckOptimization: expandedNodeCheckbox.checked,
        type: searchTypeSelectbox.value,
        callback: searchCallback
    });
}, false);

searchStepButton.addEventListener('click', function() {
    Board.clearReplay();

    if (searchStepOptions)
        return search(searchStepOptions);

    var initialNode = new Node({state: game.state});
    var iterationLimit = parseInt(iterationLimitInput.value, 10);
    var depthLimit = parseInt(depthLimitInput.value, 10);

    if (isNaN(iterationLimit))
        return alert('Invalid iteration limit');

    if (isNaN(depthLimit))
        return alert('Invalid depth limit');

    search({
        node: initialNode,
        iterationLimit: iterationLimit,
        depthLimit: depthLimit,
        expandCheckOptimization: expandedNodeCheckbox.checked,
        type: searchTypeSelectbox.value,
        stepCallback: stepCallback,
        callback: searchCallback
    });
}, false);

searchStopButton.addEventListener('click', function() {
    Board.clearReplay();
    searchResultDiv.innerHTML = '';

    window.searchStopped = true;
    setTimeout(function() {
        window.searchStopped = false;
    }, 5);
    searchStepOptions = null;

    Board.draw(game.state);
}, false);

function searchCallback(err, options) {
    var expandedNodesLength = _.size(options.expandedNodes);
    searchResultDiv.innerHTML = (err ? err : 'Solved! Depth: ' + options.node.depth) + ' <br/>' +
        ('Iteration: ' + options.iteration) + '<br/><br/>' +
        ('Expanded nodes: ' + expandedNodesLength + ' / ' + options.maxExpandedNodesLength) + '<br/>' +
        ('Frontier nodes: ' + options.frontierList.length + ' / ' + options.maxFrontierListLength) +
        (err ? '' : '<br/><br/><button onclick="replayWinnerNode()">Replay solution</button>');

    window.winnerNode = err ? null : options.node

    //game.state = options.node.state;
    Board.draw(options.node.state);

    // Draw
    if (visualizationCheckbox.checked) {
        var visualizationData = Visualization.importData(
            options.expandedNodes,
            options.frontierList,
            err ? null : options.node
        );
        Visualization.draw(visualizationData);
    }
}

function stepCallback(options) {
    searchStepOptions = options;

    Board.draw(options.node.state);

    var expandedNodesLength = _.size(options.expandedNodes);
    searchResultDiv.innerHTML = 'Stepped <br/>' +
        ('Iteration: ' + options.iteration) + '<br/><br/>' +
        ('Expanded nodes: ' + expandedNodesLength + ' / ' + options.maxExpandedNodesLength) + '<br/>' +
        ('Frontier nodes: ' + options.frontierList.length + ' / ' + options.maxFrontierListLength);

    // Draw
    if (visualizationCheckbox.checked) {
        var visualizationData = Visualization.importData(
            options.expandedNodes,
            options.frontierList,
            options.node,
            '#ffb366'
        );
    }
    Visualization.draw(visualizationData);
}

function replayWinnerNode() {
    if (!window.winnerNode)
        return alert('Winner node could not found');

    Board.draw(game.state);
    setTimeout(function() {
        boardDiv.classList.add('animation');
    }, 5);

    var moves = [];

    var traverse = function(node) {
        moves.unshift(node.state);
        if (node.parent) traverse(node.parent)
    }

    traverse(window.winnerNode);
    Board.replay(moves);
}
