'use strict';

var Controllers = {};

Controllers.renderAdminPage = function (req, res, next) {
	res.render('admin/plugins/sso-keycloak', {});
};

module.exports = Controllers;