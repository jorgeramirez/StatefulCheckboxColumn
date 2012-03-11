Ext.ux.grid.plugin.StatefulCheckboxColumn
==

Defines a grid plugin that injects a checkbox column in the
grid and handle the selection of the items through checkbox
selection. It also adds 'itemscheckedchange' event to the grid.

This class uses a Ext.state.Provider to mantain the currently 
selected items after page loads or paging.

Example
-------
A working example showing this plugin in action can be found under
the test/ directory. In order to make it work you need to change the
extjs framework path so that it point where your local copy of it resides.
Modify the following two lines inside the test/example.html file

    <link rel="stylesheet" type="text/css" href="/lib/extjs/resources/css/ext-all.css">
    <script type="text/javascript" src="/lib/extjs/ext-all-debug.js"</script>

and the following line inside test/paging.js file
    
    Ext.Loader.setPath('Ext.ux', '/lib/extjs/examples/ux/');
