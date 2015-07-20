importScripts("verovio-toolkit-webworker.js");
var vrvToolkit = new verovio.toolkit();

var loadData = function(data)
{
    vrvToolkit.loadData(data);
    var totalPages = vrvToolkit.getPageCount();
    postMessage(["returnPageCount", totalPages]);
}

var loadPage = function(pageIndex)
{
    var svgText = vrvToolkit.renderPage(pageIndex, "");
    var totalPages = vrvToolkit.getPageCount();

    postMessage(["loadedPage", pageIndex, svgText, totalPages]);
}

var initialLoad = function(data)
{
    if (data) vrvToolkit.loadData(data);

    var totalPages = vrvToolkit.getPageCount();
    postMessage(["returnPageCount", totalPages]);

    var svgText = [];
    
    for(var curPage = 1; curPage <= totalPages; curPage++)
    {
        svgText.push(vrvToolkit.renderPage(curPage));
        postMessage(["renderedPage", curPage])
    }

    postMessage(["meconium", svgText]);
};

var returnDoc = function()
{
    var totalPages = vrvToolkit.getPageCount();
    postMessage(["returnPageCount", totalPages]);
    
    for(var curPage = 0; curPage < totalPages; curPage++)
    {
        returnPage(curPage, "", true);
    }
};

//Everything coming in is 0-indexed, everything going out must be 0-indexed
var returnPage = function(pageIndex, options, init_overlay)
{
    var rendered = vrvToolkit.renderPage(pageIndex + 1, options);
    postMessage(["returnPage", pageIndex, rendered, init_overlay || false]);
};

this.addEventListener('message', function(event){
    switch (event.data[0])
    {
        case "setOptions":
            vrvToolkit.setOptions(event.data[1]);
            break;

        case "redoLayout":
            vrvToolkit.redoLayout();
//            initialLoad();
            newPage = vrvToolkit.getPageWithElement(event.data[1])
            loadPage(newPage);
            //more to do?
            break;

        case "renderPage":
            returnPage(event.data[1], event.data[2], true);
            break;

        case "loadData":
        //    initialLoad(event.data[1]);
            loadData(event.data[1]);
            loadPage(1);
            break;

        case "loadPage":
            var page = event.data[1];
            loadPage(page);
            break;

        case "edit":
            //event.data{1: editorAction, 2: 0-indexed page index, 3: init overlay (to be passed back)}
            var res = vrvToolkit.edit(event.data[1]);
            var rendered = vrvToolkit.renderPage(event.data[2] + 1, "");
            postMessage(["returnPage", event.data[2], rendered, event.data[3]]);
            break;

        case "mei":
            var mei = vrvToolkit.getMEI(0, 1);
            postMessage(["mei", mei]);
            break;

        default:
            postMessage(["Did not recognize that input."]);
            break;
    }
}, false);