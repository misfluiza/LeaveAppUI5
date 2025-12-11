sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (Controller, MessageToast, MessageBox) => {
    "use strict";

    return Controller.extend("leaveui5.controller.Detail", {

        
        onInit() {
            var obj = this.getOwnerComponent().getRouter().getRoute("Detail").attachPatternMatched(this._onObjectMatched, this);
            var obj2 = this.getView().getModel("LeaveDetailModel");
        },

         _onObjectMatched: function (oEvent) {
               //read the url parameters
                var sEmployeeID = oEvent.getParameter("arguments").EmployeeID;
                debugger
                var oDetailJSONModel = new sap.ui.model.json.JSONModel();
                var that = this;
                //read the data from Back End (READ_GET_ENTITY)
                var oDataModel = this.getOwnerComponent().getModel();
                var sPath = "/LeaveRequest(EmployeeID=guid'" + sEmployeeID + "',IsActiveEntity=true)";

                oDataModel.read(sPath, {
                    urlParameters: {
                        "$expand": "to_LeaveDetailsIH" 
                    },

                    success: function (oresponse) {
                        console.log(oresponse);
                        //attach the data to the model
                        oDetailJSONModel.setData(oresponse);
                        //attach the Model to the View
                        that.getView().setModel(oDetailJSONModel, "LeaveDetailModel");
                        console.log(that.getView().getModel("LeaveDetailModel"));
                    },
                    error: function (oerror) { },
                });
            }
    });
});