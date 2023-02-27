'use strict';

define('admin/plugins/sso-keycloak', ['settings'], function(Settings) {
	/* globals $, app, socket, require */

	var ACP = {};

	ACP.init = function() {
		Settings.load('sso-keycloak', $('.sso-keycloak-settings'));

		$('#save').on('click', function() {
			Settings.save('sso-keycloak', $('.sso-keycloak-settings'), function() {
				app.alert({
					type: 'success',
					alert_id: 'sso-keycloak-saved',
					title: 'Settings Saved',
					message: 'Please reload your NodeBB to apply these settings',
					timeout: 5000,
					clickfn: function() {
						socket.emit('admin.reload');
					}
				});
			});
		});
	};

	return ACP;
});