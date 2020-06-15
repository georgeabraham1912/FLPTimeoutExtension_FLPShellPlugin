sap.ui.define([
	"sap/ui/core/Component",
	"sap/m/Button",
	"sap/m/Bar",
	"sap/m/MessageToast"
], function (Component, Button, Bar, MessageToast) {

	return Component.extend("com.timeoutextension.flp.shell.plugin.Component", {

		metadata: {
			"manifest": "json"
		},

		init: function () {
			var rendererPromise = this._getRenderer();
			
			// Please refer to the Deploying and Configuring Shell Plugin Document
			// and create a parameter in the Portal Admin page with same below names (case sensitive)
			
			// Get Timeout Extension Plugin Deployed URL and Refresh Interval from Portal configuration
			// Deploy the app to FLP and the path till its Component.js is what is required here
			// Sample URL: "https://flpnwc-<subaccount>.dispatcher.us2.hana.ondemand.com/sap/fiori/<timeoutExtensionPluginDeployedAppName>/Component.js"
			var timeoutExtensionPluginURL = this.getComponentData().config.timeoutExtensionPluginURL;
			
			// Get Refresh Interval fro Portal configuration
			var refreshInterval = this.getComponentData().config.refreshInterval;
			
			// Call the FLP Extension Plugin for every refresh interval
			setInterval(function () {
				jQuery.ajax({
					type: "HEAD",
					cache: false,
					url: timeoutExtensionPluginURL
				}).done(
					function (result) {
						jQuery.sap.log.debug("pingServer", "Successfully pinged the server to extend the session");
					}
				).fail(
					function () {
						jQuery.sap.log.error("pingServer", "Failed to ping the server to extend the session");
					}
				);
			}, refreshInterval);

		},

		/**
		 * Returns the shell renderer instance in a reliable way,
		 * i.e. independent from the initialization time of the plug-in.
		 * This means that the current renderer is returned immediately, if it
		 * is already created (plug-in is loaded after renderer creation) or it
		 * listens to the &quot;rendererCreated&quot; event (plug-in is loaded
		 * before the renderer is created).
		 *
		 *  @returns {object}
		 *      a jQuery promise, resolved with the renderer instance, or
		 *      rejected with an error message.
		 */
		_getRenderer: function () {
			var that = this,
				oDeferred = new jQuery.Deferred(),
				oRenderer;

			that._oShellContainer = jQuery.sap.getObject("sap.ushell.Container");
			if (!that._oShellContainer) {
				oDeferred.reject(
					"Illegal state: shell container not available; this component must be executed in a unified shell runtime context.");
			} else {
				oRenderer = that._oShellContainer.getRenderer();
				if (oRenderer) {
					oDeferred.resolve(oRenderer);
				} else {
					// renderer not initialized yet, listen to rendererCreated event
					that._onRendererCreated = function (oEvent) {
						oRenderer = oEvent.getParameter("renderer");
						if (oRenderer) {
							oDeferred.resolve(oRenderer);
						} else {
							oDeferred.reject("Illegal state: shell renderer not available after recieving 'rendererLoaded' event.");
						}
					};
					that._oShellContainer.attachRendererCreatedEvent(that._onRendererCreated);
				}
			}
			return oDeferred.promise();
		}
	});
});