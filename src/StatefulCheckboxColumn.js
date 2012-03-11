/**
 * @class: Ext.ux.grid.plugin.StatefulCheckboxColumn
 * @extend: Ext.AbstractPlugin
 * 
 * Defines a grid plugin that injects a checkbox column in the
 * grid and handle the selection of the items through checkbox
 * selection. It also adds 'itemscheckedchange' event to the grid.
 * 
 * This class uses a @link {Ext.state.Provider} state provider
 * to mantain the currently selected items after page loads or
 * paging. This state provider must be defined in order to
 * use this plugin. Ext JS come with two @link {Ext.state.Provider} provider
 * implementations out of the box: @link {Ext.state.CookieProvider} and
 * @link {Ext.state.LocalStorageProvider}
 * 
 * The state is basically an array of id values, this values
 * identify uniquely each record inside the @link {Ext.grid.Panel#store} store.
 *
 * Some parts of the code are based on the @link {Ext.selection.CheckboxModel}
 * 
 * @author: Jorge Ramírez <jorgeramirez1990@gmail.com>
 **/
Ext.define('Ext.ux.grid.plugin.StatefulCheckboxColumn', {
    extend: 'Ext.AbstractPlugin',
    alias: 'plugin.statefulcheckboxcolumn',
    
    requires: [
        'Ext.state.Manager'
    ],
    
    /**
     * @cfg {Number/String} headerPos
     * Instructs to this plugin where to inject the checkbox column
     * It can be an index value, 'last' or 'first';
     **/
    headerPos: 0, // number | last | first
    
    /**
     * @cfg {Number} headerWidth
     * Header's width in pixels
     **/
    headerWidth: 50,
    
    /**
     * @cfg {String} recordIndex
     * Indicates the store record identifier used by the state manager as the
     * value to persist in the state array.
     * 
     * This value should be unique.
     **/
    recordIndex: null, //state dataindex
    
    /**
     * @cfg {String} stateId
     * The identifier used by the Ext.state.Provider to save/retrieve the
     * stateful data.
     **/
    stateId: null,
    
    /**
     * @cfg {String} headerStyle
     * Additional style to add to the header element.
     **/
    headerStyle: null,
    
    /**
     * Base header style
     * @private
     **/
    baseHeaderStyle: 'padding-left: 13px;',
    
    //selector css.
    inputCss: 'ux-grid-cell-checker',
    
    /**
     * @cfg {String[]} additionalCls
     * Extra css to applay to the wrapping div element.
     **/
    additionalCls: [], //extra css to apply to wrapping div
    
    headerCheckedCls: Ext.baseCSSPrefix + 'grid-hd-checker-on',
    
    init: function(grid) {
        var me = this;
        
        me.grid = grid;
        me.grid.addEvents(
            /**
             * @event
             * Fired after items checked has changed.
             * @param {Array} the current state array
             */
            'itemscheckedchange'
        );
        me.provider = Ext.state.Manager.getProvider();
        me.additionalCls = me.additionalCls.join(' ');
        me.injectColumn(grid.view);
        me.bindEvents();
        me.grid.checkboxColumn = me;
    },
    
    /**
     * @private
     * Injects the checkbox column in the headerCt.
     **/
    injectColumn: function(view) {
        var me = this,
            headerCt = view.headerCt,
            pos = me.headerPos,
            cfg = me.getHeaderConfig();
        
        if (pos == 'first') {
            pos = 0;
        }else if(pos == 'last') {
            pos = headerCt.getColumnCount();
        }
        headerCt.add(pos, cfg);
    },
    
    /**
     * @private
     **/
    getHeaderConfig: function() {
        var me = this;
        
        return {
            isCheckerHd: true,
            text : '&#160;',
            width: me.headerWidth,
            sortable: false,
            draggable: false,
            resizable: false,
            hideable: false,
            align: 'center',
            style: me.headerStyle + ' ' + me.baseHeaderStyle,
            menuDisabled: true,
            dataIndex: '',
            cls: Ext.baseCSSPrefix + 'column-header-checkbox ',
            renderer: Ext.Function.bind(me.renderer, me)
        }
    },
    
    /**
     * @private
     * Column renderer
     **/
    renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {
        var me = this,
            value = record.get(me.recordIndex),
            state = me.getState(),
            checked = state.indexOf(value) >= 0,
            input;
            
        metaData.tdCls = Ext.baseCSSPrefix + 'grid-cell-special';
        input = '<input class="' + me.inputCss + '" type="checkbox" ' + (checked ? 'checked' : '') + '/>';
        return '<div class="' + me.additionalCls + '">'+ input + '</div>';
    },
    
    
    /**
     * @private
     **/
    getState: function() {
        var state = this.provider.get(this.stateId);
        
        if(state === undefined){
            this.setState([]);
            state = this.provider.get(this.stateId);
        }
        return state;
    },

    /**
     * @private
     **/    
    setState: function(state) {
        if(state !== undefined){
            this.provider.set(this.stateId, state);
        }
    },
    
    destroy: function() {
        this.provider.clear(this.stateId);
    },
    
    /**
     * @private
     **/
    bindEvents: function() {
        var me = this,
            headerCt = me.grid.view.headerCt;

        headerCt.on('headerclick', this.onHeaderClick, this);
        me.grid.view.on('itemmousedown', this.onRowMouseDown, this);
        me.grid.view.on('refresh', this.onViewRefresh, this);
        me.grid.fireEvent('itemscheckedchange', me.getState());
    },    
    
    /**
     * @private
     * Toggle the ui header between checked and unchecked state.
     **/
    toggleUiHeader: function(isChecked) {
        var me = this,
            headerCt = me.grid.view.headerCt;
            checkHd  = headerCt.child('gridcolumn[isCheckerHd]');

        if (checkHd) {
            checkHd.el[isChecked ? 'addCls': 'removeCls'](me.headerCheckedCls);
        }
    },

    /**
     * @private
     * Selects/Deselects all items
     * @param {Boolean} remove
     **/    
    doSelectAll: function(remove) {
        var me = this,
            state = me.getState(),
            elements = me.grid.store.collect(me.recordIndex),
            i = 0,
            len = elements.length,
            el;
            
        for(; i < len; i++) {
            el = elements[i];
            if(remove){
                state.splice(state.indexOf(el), 1);
            }else if(state.indexOf(el) < 0){
                state.push(el);
            }
        }
        me.setState(state);
        me.grid.fireEvent('itemscheckedchange', state);
        me.grid.view.refresh();
    },

    /**
     * @private
     **/    
    onHeaderClick: function(headerCt, header, e) {
        var me = this;
        if (header.isCheckerHd) {
            e.stopEvent();
            var isChecked = header.el.hasCls(Ext.baseCSSPrefix + 'grid-hd-checker-on');
            me.doSelectAll(isChecked);
            me.toggleUiHeader(!isChecked);
        }
    },

    /**
     * @private
     **/    
    onRowMouseDown: function(view, record, item, index, e) {
        view.el.focus();
        
        var me = this,
            cls = me.inputCss,
            checkbox = e.getTarget('.' + cls),
            state = me.getState(),
            value = record.get(me.recordIndex);
            
        if(view.sortedRecordsMap !== undefined){
            value = view.store.getAt(view.sortedRecordsMap[index]).get(me.recordIndex);
        }
            
        if (checkbox) {
            checkbox = Ext.getDom(checkbox);
            if(!checkbox.checked){
                state.push(value);
            }else{
                state.splice(state.indexOf(value), 1);
            }
            me.setState(state);
            me.grid.fireEvent('itemscheckedchange', state);
            me.onViewRefresh(); //update header checkbox if necesary
        }
    },
    
    /**
     * Handles view refresh event
     * @private
     **/
    onViewRefresh: function(view, eOpts) {
        var me = this,
            state = me.getState(),
            all = true, //all selected flag
            i = 0,
            len = me.grid.store.getCount();
        
        for(; i < len; i++){
            all = state.indexOf(me.grid.store.getAt(i).get(me.recordIndex)) >= 0;
            if(!all){
                break;
            }
        }
        me.toggleUiHeader(all);
    }
});
