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
            },

        onAddNewRecord: function () {
            if (!this.oDialog) {
                this.loadFragment({
                    name: "leaveui5.fragments.CreateDialog",
                }).then(
                    function (oDialog) {
                        this.oDialog = oDialog;
                        this.oDialog.open();
                    }.bind(this)
                );
            } else {
                this.oDialog.open();
            }
        },

        onCreateNewRecord: function () {
            //Set condition when Status is different from Pending
            var sStatus = this.getView().byId("statusInput").getValue();

            if (sStatus !== 'Pending' ) {
                MessageToast.show("Please choose status 'Pending' on creation");
                return;
            };


            var mParams = {
                // Leaveid: this.getView().byId("leaveIDInput").getValue(),
                Startdate: this.getView().byId("startDateInput").getValue(),
                Enddate: this.getView().byId("endDateInput").getValue(),
                Type: this.getView().byId("typeInput").getValue(),
                Status: this.getView().byId("statusInput").getValue()
            };

            var that = this;
            var oDataModel = this.getOwnerComponent().getModel();
            this.oDialog.setBusy(true);
            debugger
            oDataModel.callFunction("/createNewEntry", {
                method: "POST",
                urlParameters: mParams,
                success: function (oData, response) {
                    //close the dialog
                    that.oDialog.close();
                },
                error: function (oError) {
                    MessageToast.show("There is an error");
                    that.oDialog.close();
                },
                finally: function() {
                    that.oDialog.setBusy(false);
                }
            });
        },

        //on Close Dialog
        onCancelRecord: function () {
            this.oDialog.close();
        },

        readRequest: function (that) {
            var oFlightModel = that.getView().getModel("leaveDataModel");
            var oDataModel = that.getOwnerComponent().getModel();
            var sPath = "/to_LeaveDetailsIH";

            oDataModel.read(sPath, {
                success: function (oresponse) {
                    console.log(oresponse);
                    //attach the data to the model
                    oFlightModel.setData(oresponse.results);
                },
                error: function (oerror) { },
            });
        },

        onUpdateRecord: function (oEvent) {
            //bind the data of the row to a model to bind it at the Dialog
            var oItem = this.getView().byId("_IDGenTable1").getSelectedItem();
            //if no item selected show  a message text
            if (oItem) {
                var oContext1 = oItem.getBindingContext("flightDataModel").getObject();
            } else {
                MessageToast.show("Select one row from the table !");
                return;
            }

            this.getView().setModel(new sap.ui.model.json.JSONModel({
                    oPayload: oContext1
                }),
                "oPayloadModel"
            );
            //open the dialog
            if (!this.oDialog_u) {
                this.loadFragment({
                    name: "flightui5v2.fragments.UpdateDialog",
                }).then(
                    function (oDialog_u) {
                        this.oDialog_u = oDialog_u;
                        this.oDialog_u.open();
                    }.bind(this)
                );
            } else {
                this.oDialog_u.open();
            }
        },

        //     onSaveRecord: function () {
        //     var oDataModel = this.getOwnerComponent().getModel();
        //     var oRecord = this.getView().getModel("oPayloadModel").getProperty("/oPayload");

        //     // The entity key must be the PRIMARY KEY of your entity
        //     // You have: Carrid + IsActiveEntity (because draft)
        //     var sCarrId = oRecord.Carrid; // take from your model
        //     var sPath = "/FlightES(Carrid='" + sCarrId + "',IsActiveEntity=true)";

        //     var that = this;

        //     oDataModel.update(sPath, oRecord, {
        //         method: "PATCH",               // optional, default is MERGE
        //         success: function () {
        //             that.oDialog_u.close();
        //             that.readFlight();      // refresh table
        //             MessageToast.show("Updated successfully");
        //         },
        //         error: function (oError) {
        //             that.oDialog_u.close();
        //             MessageToast.show("An error has occurred");
        //         }
        //     });
        // },

        onSaveRecord: function () {
            var oDataModel = this.getOwnerComponent().getModel();
            var oRecord = this.getView()
                .getModel("oPayloadModel")
                .getProperty("/oPayload");

            // Key of the airline we are updating
            var sCarrId = oRecord.Carrid;   // or from selected row
            var that = this;

            oDataModel.callFunction("/updateEntry", {
                method: "POST",          // RAP actions are POST in V2
                urlParameters: {
                    // identify which instance to update
                    Carrid: sCarrId,

                    // action parameters (ZC_FLIGHT_NEW_ENTRY_PARAM)
                    Carrname: oRecord.Carrname,
                    Currcode: oRecord.Currcode,
                    Url: oRecord.Url
                },
                success: function (oData, oResponse) {
                    that.oDialog_u.close();
                    that.onreadFlight();      // refresh the main table
                    sap.m.MessageToast.show("Updated successfully");
                },
                error: function (oError) {
                    that.oDialog_u.close();
                    sap.m.MessageToast.show("An error has occurred");
                }
            });
        },

        onCancelRow: function () {
            this.oDialog_u.close();
        },
    });
});