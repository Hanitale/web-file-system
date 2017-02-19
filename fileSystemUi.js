
function showPath(){
   $('.addressLine').val(path);
}

function buildRoot(){
    var htmlToAppend = '<li class="liFolder'+counter+'">' +
    '<img class="small" src="folders.png"> <a href="#" data-id="0" id="aRoot" data-custom ="folder"> Root</a><ul class="collapsed"></ul></li>';
    $('.folderList').append(htmlToAppend);
}

function setListeners(){
    var parent = $(".folderList");
    parent.on("click", "a", function() {
    whoClicked = $(this).attr('data-id');
    var id = $(this).attr('data-id');
    collapseExpand(id, true);
    });
    var contentItems = $(".content");
    contentItems.on("click", "a", function() {
    whoClicked = $(this).attr('data-id');
    var id = $(this).attr('data-id');
    if($(this).attr('data-custom')=='file'){
        openFile(whoClicked);
    } else{
        showContent(whoClicked, null, true);
        }
    });
    // $(window).bind('onload', function() {   //flattens and saves to localstorage
    //     readFromLocalStorage()
    // });
    $('button.clearFileContent').on('click',clearFileContent);
    $('button.saveFileContent').on('click', function (){
       saveFileContent();
    });
 }

function collapseExpand(id, changeHistory){
    var whereTo = '.liFolder' + whoClicked + '> ul';
    if($(whereTo).attr('class') == 'collapsed'){
        $(whereTo).attr('class', 'expanded');
        showFolderList(id, changeHistory);
    }else {
        $(whereTo).attr('class', 'collapsed');
        $(whereTo).empty();
        showContent(whoClicked, null, changeHistory);
    }
}

function showFolderList(id, changeHistory){
    if(currentFolder.children) {
        currentFolder = findItemById(whoClicked);
        if(currentFolder.children){
            for (var item of currentFolder.children) {
                if (item.type == 'folder') {
                    var htmlToAppend = '<li class="liFolder'+item.id+'"><img class="small" src="folders.png"> <a href="#" data-id="'
                    + item.id +'" data-custom ="folder">'
                    + item.name + '</a><ul class="collapsed"></ul></li>';
                    var whereToAppend = '.liFolder' + whoClicked + '> ul';
                    $(whereToAppend).append(htmlToAppend);
                }
            }
        }
        showContent(whoClicked, null, changeHistory);
    }
}

function showContent(id, myHistoryLocation, changeHistory) {
    $('.content').empty();
    if(myHistoryLocation) {
        currentFolder = myHistoryLocation
        path = '';
        var folder = getPath(currentFolder.id, fs);
        showPath();
    } else {
        pushToHistory(changeHistory);
        path = '';
         folder = getPath(id, fs);
        showPath();
        id = id || whoClicked;
        currentFolder = findItemById(id);
      }
    if (currentFolder.children && currentFolder.children.length > 0) {
        for (var item of currentFolder.children) {
            var liFolder = '<span><a href="#" data-custom ="folder" data-id="'+ item.id +'"><img src="folders.png"> '
                + item.name + '</a></span>';
            var liFile = '<span><a href="#" data-custom ="file" data-id="'+ item.id +'"><img src="File.png"> '
                + item.name + '</a> </span>';
            if (item.type == 'folder') {
                $('.content').append(liFolder);
            } else {
                $('.content').append(liFile);
            }
        }
    }
    setRightClickMenu();
}

function responseToUser(startMessage, Arg1, Arg2, endMessage){
    var myResponse;
    if(startMessage && Arg1 && !Arg2 && !endMessage){
        myResponse = Arg1 +startMessage;
    }
    else if(!Arg1 && Arg2){
        myResponse = startMessage + Arg2;
    }
    else if(endMessage){
        //responseToUser('Sorry, the name ', newItem ,null, ' is taken.');
        myResponse = startMessage +Arg1+ endMessage;
    }
    else if (!Arg1 && !Arg2){
        myResponse = startMessage;
    }
    $('.messageArea').text(myResponse);
    setTimeout(clearMessage, 3500);
}

function clearMessage(){

    $('.messageArea').css('display', 'none');
}

function createNewItemUi(id, type){
    var newName = prompt('Enter name of '+type+' to add');
    if(newName == null){return;}
    var ifExists = findItemByName(newName);
    if(newName == ''){
        newName = substituteName(type);
    }
    if(!ifExists){
       var newItem = createNewItem(id, newName, type);
        if(type=='folder') {
            updateFolderList(newItem, 'create')
        }
        showContent(currentFolder.id);
        id = undefined;
    } else {
        responseToUser('Sorry, the name "', newName ,null, '" is taken.');
    }
}

function updateFolderList(item, action){
    var htmlToAppend = '<li class="liFolder'+item.id+'"><img class="small" src="folders.png"> <a href="#" data-id="'
        + item.id +'" data-custom ="folder">'
        + item.name + '</a><ul class="collapsed"></ul></li>';
    var whereToAppend = '.liFolder' + currentFolder.id + '> ul';
    if(action == 'rename') {
        $(whereToAppend).empty();
    }
    $(whereToAppend).attr('class', 'expanded');
    $(whereToAppend).append(htmlToAppend);

}


