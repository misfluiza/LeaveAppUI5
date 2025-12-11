sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("leaveui5.controller.Main", {
        onInit() {
            
            var oFlightJSONModel = new sap.ui.model.json.JSONModel();
            var that = this;
            //read the data from Back End (READ_GET_ENTITYSET)
            var oDataModel = this.getOwnerComponent().getModel();
            var sPath = "/LeaveRequest";

            oDataModel.read(sPath, {
                sorters: [new sap.ui.model.Sorter("EmployeeID", false)],
                success: function (oresponse) {
                    console.log(oresponse);
                    //attach the data to the model
                    oFlightJSONModel.setData(oresponse.results);
                    //attach the Model to the View
                    that.getView().setModel(oFlightJSONModel, "leaveDataModel");
                },
                error: function (oerror) { },
            });
        },

                onListItemPress: function (oItem) {
                    debugger
            this.getOwnerComponent().getRouter().navTo("Detail", {
                EmployeeID: oItem.getSource().getBindingContext("leaveDataModel").getProperty().EmployeeID
            });
        }
    });
});