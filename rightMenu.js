function setRightClickMenu() {
    $('[data-custom]').off('contextmenu');
    $('[data-custom]').on('contextmenu', function (event) {
        event.stopPropagation();
        setRightClickMenuItems();
        showRightClickMenu(event);
        return false;
    });

    $('.fileSystem').contextmenu(function () { return false; });
    $(window).click(function () { hideRightClickMenu(); });
}

function setRightClickMenuItems() {
    $('.right-click-menu > menuitem').off('click');
    $('.right-click-menu > .rename').on('click', function () {
        var id = $('.right-click-menu').data('id');
       renameItem(id);
    });
    $('.right-click-menu > .createFolder').on('click', function () {
        var id = $('.right-click-menu').data('id');
        console.log('creating folder '+ id);
        createNewItemUi(id, 'folder');
    });
    $('.right-click-menu > .createFile').on('click', function () {
        var id = $('.right-click-menu').data('id');
        console.log('creating file '+ id);
        createNewItemUi(id, 'file');
    });
    $('.right-click-menu > .delete').on('click', function () {
       var id = $('.right-click-menu').data('id');
        console.log('deleting '+ id);
        deleteItem(id);
    });

    $('.right-click-menu > .open').on('click', function () {
       var id = $('.right-click-menu').data('id');
        console.log('opening file '+ id);
       openFile(id);
    });
}

function showRightClickMenu(e) {
    var id = $(e.currentTarget).attr('data-id');
    var type = $(e.currentTarget).attr('data-custom');
    $('menu.right-click-menu').css('display', 'block');
    $('menu.right-click-menu').attr('data-type', type);
    $('menu.right-click-menu').css('left', e.pageX + 'px');
    $('menu.right-click-menu').css('top', e.pageY + 'px');
    $('menu.right-click-menu').data('id', id);
}

function hideRightClickMenu() {
    $('menu.right-click-menu').css('display', 'none');
}