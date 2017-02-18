


function setAddressLine() {
    $('input.addressLine').keyup(function (event) {
        if (event.keyCode == 13) {
           var path = $(this).val();
            goToAddress(path);
        }
    });
}

function goToAddress(path) {
    var pathElements = path.split('/');
    var last = pathElements[pathElements.length-1];
    last = (last != '')? last:pathElements[pathElements.length-2];
    var id = findItemByName(last, fs);
    if (id != null) {
        showContent(id);
    }
}

// function findFolderByName(path, folders) {
//     if (folders) {
//         path = fixPath(path);
//         if (path) {
//             var startFolder = path[1].replace('/', '');
//             var nextPath = path[2];
//             for (var folder of folders) {
//                 if (folder.name == startFolder && nextPath == '') {
//                     return folder.id;
//                 }
//                 else if (folder.name == startFolder) {
//                     var found = findFolderByName(nextPath, folder.children)
//                     if (found) {
//                         return found;
//                     }
//                 }
//             }
//         }
//     }
// }

// function fixPath(path) {
//     path = path.replace(/\/{2,}|\/\s+|\s+\//gi, '/');
//     path = path.replace(/(\w)$/i, '$1/')
//     path = path.match(new RegExp('(.*?\/)(.*)', 'i'), "$2");
//     return path;
// }


///////////////////////////////////////////////////////////////////////
function getPath(id, fileSystem) {
    if (fileSystem) {
        for (var folder of fileSystem) {
            if (folder.id == id) {
                path = folder.name + '/' + path;
                return folder;
            }
            else {
                var found = getPath(id, folder.children);
                if (found) {
                    path = folder.name + '/' + path;
                    return found;
                }
            }
        }
    }
}

function showPath(){
   $('.addressLine').val(path);
}

function buildRootAndListeners(){

    var htmlToAppend = '<li class="liFolder'+counter+'">' +
        '<a href="#" data-id="0" id="aRoot" data-custom ="folder">' +
        '<img src="folders.png"> '+currentFolder.name +'</a>' +
        '<ul class="collapsed"></ul></li>';
    $('.folderList').append(htmlToAppend);
//---------a listeners:
    var parent = $(".folderList");
    parent.on("click", "a", function() {
    whoClicked = $(this).attr('data-id');
    collapseExpand();

 });
    var contentItems = $(".content");
    contentItems.on("click", "a", function() {
        whoClicked = $(this).attr('data-id');
        if($(this).attr('data-custom')=='file'){
            openFile(whoClicked);
        } else{
        showContent(whoClicked);
        }
    });
    $(window).bind('beforeunload', function() {
        flattenFs(fs);
    });
    // $('button.clearFileContent').on('click',clearFileContent);
    // $('button.saveFileContent').on('click', function(){
    //     var itemContent = $('textarea').val();
    //     console.log(file.content+'2 - before save back in');
    //     file.content = itemContent;
    //     $('.textarea').css('display', 'none');
    //     console.log(file.content+'3 - before leaving function ');
    //
    // })
}

function setHistoryButtons() {
    $('.back-btn').on('click', goBack);
    $('.forward-btn').on('click', goForward);
}

function goBack(e) {
    if (hereAndNow > 0) {
        showContent(null, myHistory[--hereAndNow]);
    }
}

function goForward(e) {
    if (hereAndNow < myHistory.length - 1) {
        showContent(null, myHistory[++hereAndNow]);
    }
}

function pushToHistory() {
    var isEmpty = myHistory.length == 0;
    var isNotSame = myHistory[hereAndNow] != currentFolder;
    var isEnd = hereAndNow == myHistory.length - 1;
    if (isEnd && isNotSame) {
        myHistory.push(currentFolder);
        hereAndNow++;
    } else if (isNotSame) {
        myHistory.splice(hereAndNow, myHistory.length - hereAndNow);
        if (isNotSame) {
            myHistory.push(currentFolder);
        }
    }
}

function collapseExpand(){
    var whereTo = '.liFolder' + whoClicked + '> ul';
    if($(whereTo).attr('class') == 'collapsed'){
        $(whereTo).attr('class', 'expanded');
        showFolderList();
    }else {
        $(whereTo).attr('class', 'collapsed');
        $(whereTo).empty();
        showContent(whoClicked);
    }
}

function showFolderList(){
    if(currentFolder.children) {
        currentFolder = findItemById(whoClicked);
        if(currentFolder.children){
            for (var item of currentFolder.children) {
                if (item.type == 'folder') {
                    var htmlToAppend = '<li class="liFolder'+item.id+'"><a href="#" data-id="'
                    + item.id +'" data-custom ="folder"><img src="folders.png"> '
                    + item.name + '</a><ul class="collapsed"></ul></li>';
                    var whereToAppend = '.liFolder' + whoClicked + '> ul';
                    $(whereToAppend).append(htmlToAppend);
                }
            }
        }
        showContent(whoClicked);
    }
}

function showContent(id, myHistoryLocation) {
    $('.content').empty();
    if(myHistoryLocation) {
        currentFolder = myHistoryLocation
    } else {
        pushToHistory();
        path = '';
        var folder = getPath(id, fs);
        showPath();
        currentFolder = findItemById(whoClicked);
      }
    if (currentFolder.children && currentFolder.children.length > 0) {
        for (var item of currentFolder.children) {
            var liFolder = '<span><a href="#" data-custom ="folder" data-id="'+ item.id +'"> <img src="folders.png"> '
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
    var newItem = prompt('Enter name of '+type+' to add');
    if(newItem == null){return;}
    else if(newItem == ''){
        newItem = substituteName(type);
    }
    var ifExists = findItemByName(newItem);
    if(!ifExists){
        var newItem = createNewItemBl(id, newItem, type);
        if(type=='folder') {
            updateFolderList(newItem, 'create')
        }
        showContent(id);
        id = undefined;
    } else {
        responseToUser('Sorry, the name "', newItem ,null, '" is taken.');
    }
}

function clearFileContent() {
    var x= 1;
    x++
    console.log('clearing '+x);
    $('textarea').val('');
    $('textarea').focus();
}

function substituteName(item) {
    var name = (newFolderCounter == 0) ? 'New'+ item:'New'+ item + newFolderCounter;
    if(item == 'Folder') {
        newFolderCounter++;
    } else {
        newFileCounter++;
    }
    return name;
}

function updateFolderList(item, action){
    var htmlToAppend = '<li class="liFolder'+item.id+'"><a href="#" data-id="'
        + item.id +'" data-custom ="folder"><img src="folders.png"> '
        + item.name + '</a><ul class="expanded"></ul></li>';
    var whereToAppend = '.liFolder' + currentFolder.id + '> ul';
    if(action == 'rename') {
        $(whereToAppend).empty();
    }
    $(whereToAppend).append(htmlToAppend);
}

function deleteItem(id) {
    if(id == 0){
        responseToUser("Root directory cannot be deleted");
    } else {
        var itemToDelete = findItemById(id)
        var areYouSure = prompt('Are you sure you want to delete ' + itemToDelete.name + '? y/n');
        if (areYouSure != 'y') {
            responseToUser("Action cancelled");
        } else {
            var hasBeenDeleted = recursionMDFK( currentFolder, fs, id);
            if(hasBeenDeleted){
                id = undefined;
                showContent(currentFolder.id);
                responseToUser(" has been deleted", itemToDelete.name );
            } else{
                $('.messageArea').text(itemToDelete.name + " cannot be deleted MADAFUKA");
                setTimeout(clearMessage, 3000);
            }
        }
    }
}

function updateFolderListAfterDeletion(){
    var whereToAppend = '.liFolder' + currentFolder.id +'>ul';
    $(whereToAppend).remove();
}

function renameItem(id){
    if(id == 0){
        responseToUser('Sorry, cannot change Root directory name');
    }  else{
        var item = findItemById(id);
        var itemType = (item.type == 'folder')? "Folder":"File";
        var newName = prompt('Enter new name');
        if(newName == null){return;}
        else if(newName == ''){
            newName = substituteName(itemType);
        }
        var ifExists = findItemByName(newName);
        if(!ifExists){
            item.name = newName;
            updateFolderList(item, 'rename');
            showContent(id);
        } else {
            responseToUser('Sorry, the name ', newName , null, ' is taken.');
        }
    }
}

