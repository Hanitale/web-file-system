// var foo = (function() {    //now we call the functions returned below as foo.function
//     "use strict";
$(document).ready(function(){
    "use strict";
    init();
});

function init(){
    readFromLocalStorage();
    buildRootAndListeners();
    showContent(ROOT_ID);
    setRightClickMenu();
    setHistoryButtons();
    setAddressLine();

}

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
var index = null;
var myHistory = [];
var hereAndNow = -1;
var path = '';
var found = 0;
var fsFlatArray = [];
var lastId;

    function readFromLocalStorage() {
        var localStorageContent = localStorage.getItem('fs');
        fsFlatArray = JSON.parse(localStorageContent)
        lastId = fsFlatArray.length;
        restoreFileSystem(fsFlatArray);
    }

    function restoreFileSystem(fsFlatArray) {
        var tempArray = [];
        fsFlatArray.forEach(function (item) {
            if (item.parentId == undefined) {
                tempArray.push(item);
            }
        })
        fs = tempArray.slice();
    }



function findItemByName(itemName, fileSystem) {
    fileSystem = fileSystem || root
    if(itemName!='root'){
        for(var item of fileSystem.children) {
            if(item.name == itemName) {
            return item;
        } else if(item.children){
            var folder = findItemByName(itemName, item);
            if(folder) return folder;
           }
        }
    }
    return false;         // throw new Error("Couldn't find a folder by that name");
}

function findFatherById(id, fileSystem) {
    if(id == 0 || id == null) return root;
    fileSystem = fileSystem || root;
    if(fileSystem.type ='folder'){
        for(var i = 0; i < fileSystem.children.length; i++) {
            if(fileSystem.children[i].id == id) {
            var father = fileSystem.children[i];
            var index = i;
            var fatherAndIndex = {'father': father, 'index' : index};
                return fatherAndIndex;
            } else if(fileSystem.children[i].children){
                var found = findFatherById(id, fileSystem.children[i]);
                if(found) {
                    father = fileSystem.children[i];
                    index = i;
                    fatherAndIndex = {'father': father, 'index' : index};
                    return fatherAndIndex;
                }

            }
        }
    }
    return false;
}

function recursionMDFK(here, everywhere, seeking) {
    var found = 0;
    for (var i = 0; i < everywhere.length; i++) {
        if(found == 1){
            return here;
        }
        else if (everywhere[i] == here) {
           for (var x = 0; x < here.children.length; x++) {
                if (here.children[x].id == seeking) {
                    console.log('i am ' + here.children[x].name + ', the one to deleted');
                    here.children.splice(x, 1);
                    found = 1;
                    return here;
                }
            }
        }
        console.log('i am ' + everywhere[i].name + ', not the one to deleted');
        if (everywhere[i].children) {
            recursionMDFK(here, everywhere[i].children, seeking);
        }
    }
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

function createNewItemBl(id, newItemName, type){
    ++lastId;
    var parent = (id == undefined)? currentFolder:findItemById(id);
    if(type == 'file') {
        var newItem = {type: type, id: lastId, name: newItemName, content: ''}
        $('textarea').val('');
        parent.children.push(newItem);
        openFile(newItem.id);
        console.log(newItem.content+'4, after create');
     }  else {
        newItem = {type: 'folder', id: lastId, name: newItemName, children: []}
        parent.children.push(newItem);
    }
    currentFolder = parent;
    console.log(newItem.content+'5, at end of push into parent');
    return newItem;
}

// function updateFileContent(item){
//     $('.textarea').css('display', 'block');
//     $('textarea').focusin();
//     $('button.clearFileContent').on('click',clearFileContent);
//     $('button.saveFileContent').on('click', function(){
//         var itemContent = $('textarea').val();
//        item.content = itemContent;
//         $('textarea').val('');
//         $('.textarea').css('display', 'none');
//         return itemContent;
//     })
// }

function openFile(id) {
     var file = findItemById(id, currentFolder);
     if(file) {
        console.log(file.content+'1 - at the begining');
        $('.textarea').css('display', 'block');
        $('textarea').val(file.content);
        $('textarea').focusin();
        $('button.clearFileContent').on('click',clearFileContent);
        $('button.saveFileContent').on('click', function(){
        var itemContent = $('textarea').val();
        console.log(file.content+'2 - before save back in');
        file.content = itemContent;
        $('.textarea').css('display', 'none');
        console.log(file.content+'3 - before leaving function ');

    })
         // make this work:
       //  $('.content').click(function () {  $('.textarea').css('display', 'none'); });
}}


function flattenFs(everybody, parentId){
    for(var somebody of everybody){
    somebody.parentId = parentId;
    flatArray.push(somebody);
        if(somebody.type == 'folder'){
            parentId = somebody.id;
            flattenFs(somebody.children, parentId);
        }
    }
    saveToTextFile(flatArray);
}


function saveToTextFile(flatArray){
    var fsContent = JSON.stringify(flatArray);
    localStorage.setItem('fs', fsContent)
    responseToUser('FileSystem saved Successfully to JSON text.txt');
   // responseToUser('GoodBye from your File System');
}


// return {
//         findItemByName: findItemByName,
//         findItemById: findItemById,
//         createNew: createNew,
//
//     };
// })();
