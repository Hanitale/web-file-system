// var bl = (function() {
//     "use strict";
    const ROOT_ID = 0;
    var fs = [{type:'folder',
        id: 0,
        name: 'root',
        children: [{type:'folder',
            id: 1,
            name: 'sub1',
            children: [{type:'file',
                id: 2,
                name: 'file1',
                content: 'Hear me ROARRR'
            }, {type:'folder',
                id: 5,
                name: 'sub5',
                children: [{type:'file',
                    id: 6,
                    name: 'file3',
                    content: 'I am playing...'
                }]
            }]
        }, {type:'folder',
            id: 3,
            name: 'sub2',
            children: [{
                id: 4,
                name: 'file2',
                content: 'text'
            }]
        },{type:'file',
            id: 7,
            name: 'file 8',
            content: 'I too am playing...'
        }]
    }];
    var root = fs[0];
    var currentFolder = root;
    var counter = 0;
    var newFolderCounter = 0;
    var newFileCounter =0;
    var whoClicked = null;
    var myHistory = [];
    var hereAndNow = -1;
    var path = '';
    var fsFlatArray = [];
    var lastId;
    var folder_to_delete_found = 0;

$(document).ready(function(){
    "use strict";
    fs = readFromLocalStorage() || fs;
     init();
});

function init(){
    buildRoot();
    setListeners();
    showContent(ROOT_ID);
    setRightClickMenu();
    setHistoryButtons();
    setAddressLine();
}

function readFromLocalStorage() {
   var localStorageContent = localStorage.getItem('fs');
    if (localStorageContent) {
        fsFlatArray = JSON.parse(localStorageContent)
        restoreFileSystem(fsFlatArray);
    } else {
        fs = [{type:'folder',
            id: 0,
            name: 'root',
            children: [{type:'folder',
                id: 1,
                name: 'sub1',
                children: [{type:'file',
                    id: 2,
                    name: 'file1',
                    content: 'Hear me ROARRR'
                }, {type:'folder',
                    id: 5,
                    name: 'sub5',
                    children: [{type:'file',
                        id: 6,
                        name: 'file3',
                        content: 'I am playing...'
                    }]
                }]
            }, {type:'folder',
                id: 3,
                name: 'sub2',
                children: [{
                    id: 4,
                    name: 'file2',
                    content: 'text'
                }]
            },{type:'file',
                id: 7,
                name: 'file 8',
                content: 'I too am playing...'
            }]
        }];
    }
}
function restoreFileSystem(fsFlatArray) {
    lastId = fsFlatArray.length || 7;
    var tempArray = [];
    fsFlatArray.forEach(function (item) {
        if (item.parentId == undefined) {
            tempArray.push(item);
        }
    })
    fs = tempArray.slice();
}

function findItemByName(itemName, fileSystem) {
    if (itemName == 'root') return root;
    fileSystem = fileSystem || root;
    if (fileSystem.type = 'folder') {
        for (var item of fileSystem.children) {
            if (item.name == itemName) {
                return item;
            } else if (item.children) {
                var folder = findItemByName(itemName, item);
                if (folder) return folder;
            }
        }
    }
    return false;
}

function findItemById(id, fileSystem) {
    if(id == 0 || id == null) return root;
    fileSystem = fileSystem || root;
    if(fileSystem.type ='folder'){
        for(var item of fileSystem.children) {
            if(item.id == id) {
                return item;
            } else if(item.children){
                var folder = findItemById(id, item);
                if(folder) return folder;
            }
        }
    }
    return false;
}

function createNewItem(id, newItemName, type){
    ++lastId;
    var parent = (id == undefined)? currentFolder:findItemById(id);
    if(type == 'file') {
        var newItem = {type: type, id: lastId, name: newItemName, content: ''}
        $('textarea').val('');
        parent.children.push(newItem);
        console.log(newItem.id+', '+newItem.content+'1 - before open file');
        openFile(newItem.id);
    }  else {
        newItem = {type: 'folder', id: lastId, name: newItemName, children: []}
        parent.children.push(newItem);
        flattenAndSave(fs);
    }
    currentFolder = parent;
    return newItem;
}

function substituteName(item) {
        if(item == 'folder') {
            var name = (newFolderCounter == 0) ? 'New Folder':'New Folder' + newFolderCounter;
            newFolderCounter++;
        } else {
            name = (newFileCounter == 0) ? 'New File':'New File' + newFileCounter;
            newFileCounter++;
        }

        return name;
    }

function openFile(id) {
    var file = findItemById(id, currentFolder);
    if(file) {
        $('.textarea').css('display', 'block');
        $('textarea').attr('data-id', id);
        $('textarea').val(file.content);
        $('textarea').focus();
        $('.textarea').keyup(function (event) {
            if (event.keyCode == 27) {
                saveFileContent()
            }
        });
        $('textarea').blur(function (event) {

            saveFileContent()

        });
    }
}

function clearFileContent() {
    var x= 1;
    x++
    console.log('clearing '+x);
    $('textarea').val('');
    $('textarea').focus();
}

function saveFileContent(){
        var id = $('textarea').attr('data-id');
        var file = findItemById(id)
        var itemContent = $('textarea').val();
        file.content = itemContent;
        flattenAndSave(fs);
        $('.textarea').css('display', 'none');


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
                responseToUser('Sorry, please enter a valid name');
                return;
            }
            var ifExists = findItemByName(newName);
            if(!ifExists){
                item.name = newName;
                flattenAndSave(fs);
                $('a[data-id='+id+']').text(newName);
                showContent(id);
            } else {
                responseToUser('Sorry, the name ', newName , null, ' is taken.');
            }
        }
    }

function deleteItem(id) {
    if(id == 0){
        responseToUser("Root directory cannot be deleted");
    } else {
        var itemToDelete = findItemById(id)
        var areYouSure = confirm('Are you sure you want to delete ' + itemToDelete.name + '?');
        if (!areYouSure) {
            responseToUser("Action cancelled");
        } else {
        folder_to_delete_found = 0;
            var hasBeenDeleted = findAndDelete( currentFolder, id);
            if(hasBeenDeleted){
                id = undefined;
                showContent(currentFolder.id);
                responseToUser(" has been deleted", itemToDelete.name );
            } else{
                $('.messageArea').text(itemToDelete.name + " cannot be deleted");
                setTimeout(clearMessage, 3000);
            }
        }
    }
}

function findAndDelete(current_Folder, seeking) {
        for (var i = 0; i < current_Folder.children.length; i++) {
            if (folder_to_delete_found == 1) {
                return current_Folder;
            }
            if (current_Folder.children[i].id == seeking) {
                current_Folder.children.splice(i, 1);
                flattenAndSave(fs);
                folder_to_delete_found = 1;
                return current_Folder;
            } else {
                if (current_Folder.children[i].children) {
                    findAndDelete(current_Folder.children[i], seeking);

                }
            }

        }

    }

function setAddressLine() {
    $('input.addressLine').keyup(function (event) {
        if (event.keyCode == 13) {
            var path = $(this).val();
            goToAddress(path);
        }
    });
}

function goToAddress(path) {
    alert('taking last one');
    var pathElements = path.split('/');
    var last = pathElements[pathElements.length-1];
    last = (last != '')? last:pathElements[pathElements.length-2];
    var item = findItemByName(last);
    if (item) {
        showContent(item.id);
    }
}

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

function pushToHistory(changeHistory) {
        var isEmpty = myHistory.length == 0;
        var isNotSame = myHistory[hereAndNow] != currentFolder;
        var isEnd = hereAndNow == myHistory.length - 1;
        if (isEnd && isNotSame) {
            myHistory.push(currentFolder);
            hereAndNow++;
        } else if (changeHistory) {
            myHistory.splice(hereAndNow, myHistory.length - hereAndNow);
            if (isNotSame) {
                myHistory.push(currentFolder);
            }
        }
    }

function flattenAndSave(everybody, parentId){
    for(var somebody of everybody){
        somebody.parentId = parentId;
        fsFlatArray.push(somebody);
        if(somebody.type == 'folder'){
            parentId = somebody.id;
            flattenAndSave(somebody.children, parentId);
        }
    }
    saveToLocalStorage(fsFlatArray);
}

function saveToLocalStorage(fsFlatArray){
        var fsContent = JSON.stringify(fsFlatArray);
        localStorage.clear();
        localStorage.setItem('fs', fsContent)
        responseToUser('FileSystem saved Successfully to LocalStorage');
        // responseToUser('GoodBye from your File System');
    }

// return {
//     init:init,
//     readFromLocalStorage:readFromLocalStorage,
//     restoreFileSystem:restoreFileSystem,
//
//     findItemByName: findItemByName,
//     findItemById: findItemById,
//     createNewItem:createNewItem,
//     substituteName:substituteName,
//     openFile:openFile,
//     clearFileContent:clearFileContent,
//     saveFileContent:saveFileContent,
//     renameItem:renameItem,
//     deleteItem:deleteItem,
//     findAndDelete:findAndDelete,
//
//     setAddressLine:setAddressLine,
//     goToAddress:goToAddress,
//     getPath:getPath,
//
//     setHistoryButtons:setHistoryButtons,
//     goBack:goBack,
//     goForward:goForward,
//     pushToHistory:pushToHistory,
//
//     flattenAndSave:flattenAndSave,
//     saveToLocalStorage:saveToLocalStorage,
//   };
// })();
