'use strict';

(function(module) {

	var User = require.main.require('./src/user'),
			Groups = require.main.require('./src/groups'),
			meta = require.main.require('./src/meta'),
			db = require.main.require('./src/database'),
			passport = require.main.require('passport'),
			nconf = require.main.require('nconf'),
			winston = require.main.require('winston'),
			async = require('async'),

			pluginStrategies = [],
			OAuth = {}, passportOAuth, opts;

	OAuth.init = function(params, callback) {
		var router = params.router,
				hostControllers = params.controllers,
				controllers = require('./controllers');

		router.get('/admin/plugins/sso-keycloak', hostMiddleware.admin.buildHeader, controllers.renderAdminPage);
		router.get('/api/admin/plugins/sso-keycloak', controllers.renderAdminPage);

		meta.settings.get('sso-keycloak', function(err, settings) {
			if (settings && ['url', 'id', 'secret'].every(function(key) {
				return settings.hasOwnProperty(key) && settings[key]
			})) {
				pluginStrategies.push({
					name: 'keycloak2',
					oauth2: {
						authorizationURL: settings.url + '/realms/master/protocol/openid-connect/auth',
						tokenURL: settings.url + '/realms/master/protocol/openid-connect/token',
						clientID: settings.id,
						clientSecret: settings.secret
					},
					scope: settings.scope,
					userRoute: settings.url + '/realms/master/protocol/openid-connect/userinfo'
				});

				callback();
			} else {
				winston.verbose('[plugin/sso-keycloak] Please complete configuration for Keycloak SSO login');
				callback();
			}
		});
	};

	OAuth.addAdminNavigation = function(header, callback) {
		header.authentication.push({
			route: '/plugins/sso-keycloak',
			icon: 'fa-key',
			name: 'Keycloak'
		});

		callback(null, header);
	};

	OAuth.getStrategy = function (strategies, callback) {
		passportOAuth = require('passport-oauth').OAuth2Strategy;

		opts = pluginStrategies[0].oauth2;
		opts.callbackURL = nconf.get('url') + '/auth/' + pluginStrategies[0].name + '/callback';

			passportOAuth.Strategy.prototype.userProfile = function (accessToken, done) {

				// If your OAuth provider requires the access token to be sent in the query  parameters
				// instead of the request headers, comment out the next line:
				this._oauth2._useAuthorizationHeaderForGET = true;

				this._oauth2.get(pluginStrategies[0].userRoute, accessToken, function (err, body/* , res */) {
					if (err) {
						return done(err);
					}

					try {
						var json = JSON.parse(body);
						OAuth.parseUserReturn(json, function (err, profile) {
							if (err) return done(err);
							profile.provider = pluginStrategies[0].name;
							done(null, profile);
						});
					} catch (e) {
						done(e);
					}
				});
			};

			opts.passReqToCallback = true;

			passport.use(pluginStrategies[0].name, new passportOAuth(opts, async (req, token, secret, profile, done) => {
				const user = await OAuth.login({
					oAuthid: profile.id,
					handle: profile.displayName,
					email: profile.emails[0].value,
					isAdmin: profile.isAdmin,
				});

				authenticationController.onSuccessfulLogin(req, user.uid);
				done(null, user);
			}));

			strategies.push({
				name: pluginStrategies[0].name,
				url: '/auth/' + pluginStrategies[0].name,
				callbackURL: '/auth/' + pluginStrategies[0].name + '/callback',
				icon: 'fa-key',
				scope: (pluginStrategies[0].scope || '').split(','),
			});

			callback(null, strategies);
	};

	OAuth.parseUserReturn = function (data, callback) {
		// Alter this section to include whatever data is necessary
		// NodeBB *requires* the following: id, displayName, emails.
		// Everything else is optional.

		// Find out what is available by uncommenting this line:
		console.log(data);

		var profile = {};
		profile.id = data.id;
		profile.displayName = data.name;
		profile.emails = [{ value: data.email }];

		// Do you want to automatically make somebody an admin? This line might help you do that...
		profile.isAdmin = data.isAdmin ? true : false;

		// Delete or comment out the next TWO (2) lines when you are ready to proceed
		//process.stdout.write('===\nAt this point, you\'ll need to customise the above section to id, displayName, and emails into the "profile" object.\n===');
		//return callback(new Error('Congrats! So far so good -- please see server log for details'));

		// eslint-disable-next-line
		callback(null, profile);
	};

	OAuth.login = async (payload) => {
		let uid = await OAuth.getUidByOAuthid(payload.oAuthid);
		if (uid !== null) {
			// Existing User
			return ({
				uid: uid,
			});
		}

		// Check for user via email fallback
		uid = await User.getUidByEmail(payload.email);
		if (!uid) {
			// New user
			uid = await User.create({
				username: payload.handle,
				email: payload.email,
			});
		}

		// Save provider-specific information to the user
		await User.setUserField(uid, pluginStrategies[0].name + 'Id', payload.oAuthid);
		await db.setObjectField(pluginStrategies[0].name + 'Id:uid', payload.oAuthid, uid);

		if (payload.isAdmin) {
			await Groups.join('administrators', uid);
		}

		return {
			uid: uid,
		};
	};

	OAuth.getUidByOAuthid = async (oAuthid) => db.getObjectField(pluginStrategies[0].name + 'Id:uid', oAuthid);

	OAuth.deleteUserData = function (data, callback) {
		async.waterfall([
			async.apply(User.getUserField, data.uid, pluginStrategies[0].name + 'Id'),
			function (oAuthIdToDelete, next) {
				db.deleteObjectField(pluginStrategies[0].name + 'Id:uid', oAuthIdToDelete, next);
			},
		], function (err) {
			if (err) {
				winston.error('[sso-keycloak] Could not remove OAuthId data for uid ' + data.uid + '. Error: ' + err);
				return callback(err);
			}

			callback(null, data);
		});
	};

	// If this filter is not there, the deleteUserData function will fail when getting the oauthId for deletion.
	OAuth.whitelistFields = function (params, callback) {
		params.whitelist.push(pluginStrategies[0].name + 'Id');
		callback(null, params);
	};

	module.exports = OAuth;
}(module));