'use strict';

function renderAdminPage(req, res) {
	res.render('admin/plugins/keycloak', {});
}


module.exports = {
	renderAdminPage,
};
