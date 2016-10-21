var SearchType = {
    BREADTH_FIRST: 'breadthFirst',
    DEPTH_FIRST: 'depthFirst'
};

function search(opt_options) {
    var options = _.assign({
        node: null,
        frontierList: [],
        expandedNodes: {},
        iteration: 0,
        iterationLimit: 1000,
        depthLimit: 0,
        expandCheckOptimization: false,
        callback: function() {},
        stepCallback: null,
        type: SearchType.BREADTH_FIRST
    }, opt_options || {});

    Board.draw(options.node.state);

    if (options.node.game.isFinished()) {
        return options.callback(null, options);
    }

    // Expand current node
    var expandedList = options.node.expand();
    options.expandedNodes[options.node.state] = options.node;

    // Filter just-expanded nodes
    var expandedUnexploredList = expandedList.filter(function(node) {
        // Check depth
        if (options.depthLimit && node.depth > options.depthLimit)
            return false;

        // Check whether node is already expanded
        if (!!options.expandedNodes[node.state])
            return false;

        // Check whether there is a better alternative (lower-cost) in frontier list
        var alternativeNode = _.find(options.frontierList, {state: node.state});
        if (alternativeNode && alternativeNode.cost <= node.cost)
            return false;
        else if (alternativeNode && alternativeNode.cost > node.cost) {
            _.remove(options.frontierList, alternativeNode);
        }

        return true;
    });

    // Add filtered just-expanded nodes into frontier list
    options.frontierList = options.frontierList.concat(expandedUnexploredList);

    // Check whether desired state is in just-expanded list
    if (options.expandCheckOptimization) {
        var desiredNode = _.find(expandedUnexploredList, function(unexploredNode) {
            return unexploredNode.game.isFinished();
        });

        if (desiredNode) {
            return options.callback(null, _.assign({}, options, {node: desiredNode}));
        }
    }

    // Next call
    var nextNode = getNextNode(options);
    if (!nextNode) {
        return options.callback(new Error('Frontier list is empty'), options);
    }

    // Iteration check
    options.iteration++;
    if (options.iterationLimit && options.iteration > options.iterationLimit) {
        return options.callback(new Error('Iteration limit reached'), options);
    }

    if (window.searchStopped) {
        window.searchStopped = false;
        return options.callback(new Error('Search stopped'), options);
    }

    if (options.stepCallback) {
        options.stepCallback(_.assign(options, {node: nextNode}));
    } else {
        setTimeout(function() {
            search(_.assign(options, {node: nextNode}));
        }, 0);
    }
}


function getNextNode(options) {
    switch (options.type) {
        case SearchType.BREADTH_FIRST:
            return options.frontierList.shift();
        case SearchType.DEPTH_FIRST:
            return options.frontierList.pop();
        default:
            throw new Error('Unsupported search type');
    }
}
