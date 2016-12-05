(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const frictionlessSignup = require('./lib/FrictionlessSignup')()


frictionlessSignup.run()

},{"./lib/FrictionlessSignup":4}],2:[function(require,module,exports){
const CLEARBIT_ENRICHMENT_API_URL = 'https://frictionless-auth.herokuapp.com/clearbit/';
const MADKUDU_PREDICTION_API_URL = 'https://frictionless-auth.herokuapp.com/madkudu/predict';

var Api = function () {

}

Api.prototype.callServer = function (email, callback) {

	console.log('Call Server');
	var request = new XMLHttpRequest();
	var url = CLEARBIT_ENRICHMENT_API_URL + email
	var params = '';

	request.open('GET', url, true);
	request.setRequestHeader('Content-type', 'application/json');

	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			var res = JSON.parse(request.responseText);
			callback(res);
		} else {
			console.log('error API');
		}
	};

	request.onerror = function() {
		console.log('connexion error');
	};

	request.send();
}

Api.prototype.callClearbit = function () {


}

Api.prototype.callSegment = function () {

}

Api.prototype.callMadKudu = function (lead_information, callback) {

	console.log('Call MadKudu API');
	var request = new XMLHttpRequest();

	const post_data = JSON.stringify(lead_information);

	request.open('POST', MADKUDU_PREDICTION_API_URL, true);
	request.setRequestHeader('Content-type', 'application/json');

	request.onreadystatechange = function () {
	    if (request.readyState == 4 && request.status == 200) {
				var json_response = null;
				try {
					json_response = JSON.parse(request.responseText)
				}
				catch(err) {
					return callback('Could not read MadKudu\'s API response.')
				}
				callback(null, json_response);
	    }
	}

	request.onerror = function(err) {
		console.log('Connection error while contacting MadKudu api.');
		callback(err);
	};

	request.send(post_data);
}

module.exports = function () {
	return new Api()
}

},{}],3:[function(require,module,exports){
/**
* Display file contain all interactions with the view.
* I/O file
*/

var Display = function () {
	this.frictionlessSelectors = {}
}

/*
* Get the email in params
*/

Display.prototype.getUrlParameter = function (sParam) {
	var sPageURL = decodeURIComponent(window.location.search.substring(1)),
		sURLVariables = sPageURL.split('&'),
		sParameterName,
		i;

	for (i = 0; i < sURLVariables.length; i++) {
		sParameterName = sURLVariables[i].split('=');

		if (sParameterName[0] === sParam) {
			return sParameterName[1] === undefined ? true : sParameterName[1];
		}
	}
}

/*
* Get data in a field
*/

Display.prototype.getDataField = function (selector) {

	var data = this.fieldIsEmpty(selector) === true ? null : selector.value

	return data
}

/*
* Get the key (clearbit endpoint wanted) in the data attributes
*/

Display.prototype.getKeyField = function (selector) {

	var key = selector.getAttribute('frictionless')

	return key
}

/*
* Get the mapping key in the data attributes
*/

Display.prototype.getKeyFieldMapping = function (selector) {

	var key = selector.getAttribute('frictionless-mapping')

	return key
}

/*
* Search a selector with a specific key/name
*/

Display.prototype.getSelectorWithName = function (name) {

	for (var i = 0; i < this.frictionlessSelectors.length; i++) {

		var selector = this.frictionlessSelectors[i];
		var key = selector.getAttribute('frictionless')

		if (key === name)
			return selector
	}

	return null
}

/*
* Get a custom mapping key
*/

Display.prototype.customMapper = function (key, value, selector) {
	var res = null;

	if (typeof window[key] === 'function')
		res = window[key](value, selector)
	else
		console.log('You need to create a function in the main file with this name: ', key);
	return res
}

/*
* Show the request demo section
*/

Display.prototype.show_request_demo = function () {
	var selector = this.getSelectorWithName('requestDemoSection');
	if (selector && selector.style) {
		selector.style.display = 'inline';
	}
}

/*
* Hide the request demo section
*/

Display.prototype.hide_request_demo = function () {
	var selector = this.getSelectorWithName('requestDemoSection');
	if (selector && selector.style) {
		selector.style.display = 'none';
	}
}


/*
* Set the field value according to mapper or if field is empty
*/

Display.prototype.setDataField = function (selector, value) {

	var mapping = this.getKeyFieldMapping(selector)

	if (mapping) {
		selector.value = this.customMapper(mapping, value, selector);
	}
	else if (this.fieldIsEmpty(selector) === true) {
		selector.value = value
	}
}

/**
* Check if field is empty (returns bool)
*/

Display.prototype.fieldIsEmpty = function (selector) {
	var empty = true;

	if (selector.value)
		empty = selector.value.length === 0 ? true : false
	return empty
}

/**
* Get all fields on the document with selector frictionless and return an object
*/

Display.prototype.getAllFields = function () {

	var frictionlessData = {};

	this.frictionlessSelectors = document.querySelectorAll('[frictionless]')
	console.log(this.frictionlessSelectors)
	for (var i = 0; i < this.frictionlessSelectors.length; i++) {

		var key = this.getKeyField(this.frictionlessSelectors[i])
		var data = this.getDataField(this.frictionlessSelectors[i])

		frictionlessData[key] = data;
	}

	return frictionlessData
}

/**
*
*/

Display.prototype.setAllFields = function (data_form) {

	for (var i = 0; i < this.frictionlessSelectors.length; i++) {

		var selector = this.frictionlessSelectors[i]
		var key = this.getKeyField(selector)
		var data = this.getDataField(selector)

		this.setDataField(selector, data_form[key])

	}
}

/**
* Add on all fields the onfocus emmitter
*/

Display.prototype.setAllEmitter = function () {

	for (var i = 0; i < this.frictionlessSelectors.length; i++) {

		var field = this.frictionlessSelectors[i];

		this.setEmitter(field);
	}
};

/**
* Add an listener on all frictionlessSelectors, to autofill when the data is available
*/

Display.prototype.setListenerSelector = function (selector, name, func) {
	selector.addEventListener(name, func)
}

/**
* Create and dispatch an event touht the application
*/

Display.prototype.dispatchEventGlobal = function (name) {

	var event = new Event(name)

	dispatchEvent(event)
}

/**
* Send an event when the user focus out, with name 'focusout'
*/

Display.prototype.setEmitter = function (selector) {

	var name = this.getKeyField(selector)
	var self = this;

	this.setListenerSelector(selector, 'focusout', () => {
		this.dispatchEventGlobal(name + ' ' + 'focusout')
	})
}

module.exports = function () {
	return new Display
}

},{}],4:[function(require,module,exports){

var Helper = require('./Helper')
var Mapper = require('./Mapper')
var Display = require('./Display')
var Api = require('./Api')

var FrictionlessSignup = function () {
	this.helper = Helper()
	this.mapper = Mapper()
	this.display = Display()
	this.api = Api()
	this.data_form = {}
	this.metadata = {}
	this.discarded = false
}

FrictionlessSignup.prototype.setEvents = function () {
	// Set all emitter focusout on frictionlessSelectos
	this.display.setAllEmitter()

	// Add all events listenners
	addEventListener('email valid', () => {

		console.log('email valid: ',this.data_form.email);

	})

	addEventListener('email invalid', () => {

		console.log('email invalid: ',this.data_form.email);

	})

	// On event "focus out", get email field + value
	addEventListener('email focusout', () => {
		console.log('Email event focusout');

		var selectorEmail = this.display.getSelectorWithName('email')
		var email = this.display.getDataField(selectorEmail)

		this.data_form.email = email
		this.emailAvailable()
	})

}

// When email available, check if valid
FrictionlessSignup.prototype.emailAvailable = function () {

	if (this.helper.checkEmail(this.data_form.email) === true) {
		this.display.dispatchEventGlobal('email valid')
		this.callApi()
	} else {
		this.display.dispatchEventGlobal('email invalid')
	}
}

// Get all fields from form
FrictionlessSignup.prototype.getForm = function () {
	console.log('Get Form');

	this.data_form = this.display.getAllFields()
}

FrictionlessSignup.prototype.getEmail = function () {

	console.log('Get Email');

	// Get email from URL
	this.data_form.email = this.display.getUrlParameter('email');
	if (this.data_form.email) {
		var selectorEmail = this.display.getSelectorWithName('email');
		this.display.setDataField(selectorEmail, this.data_form.email)
		this.emailAvailable()
	}
}

FrictionlessSignup.prototype.callApi = function () {
	console.log('Call Api');

	this.api.callServer(this.data_form.email,
		(res) => {
		this.mapData(res)
		this.show_request_demo_to_VIPs(res)
	})

}

FrictionlessSignup.prototype.mapData = function (data) {
	console.log('Map Data');

	this.data_form = this.mapper.mapData(this.data_form, data)

	this.prefill()
}

FrictionlessSignup.prototype.show_request_demo_to_VIPs = function (data) {
	console.log('Get customer fit segment from MadKudu');
	// make an API call to your MadKudu api proxy
	this.api.callMadKudu(data, (err, res) => {
		if (err) {
			return console.error('Error fetching customer fit from MadKudu: ' + err);
		}
		// display "request a demo" section if customer fit is good or very good
		if (res.customer_fit && ['good', 'very good'].indexOf(res.customer_fit.segment) > -1) {
			console.log('Show request demo section.');
			this.display.show_request_demo();
		}
		else {
			console.log('Hide request demo section.');
			this.display.hide_request_demo();
		}
	});
}

FrictionlessSignup.prototype.prefill = function () {
	console.log('Prefill');

	this.display.setAllFields(this.data_form)
}

FrictionlessSignup.prototype.run = function () {
	this.getForm()
	this.setEvents()
	this.getEmail()
}

module.exports = function () {
	return new FrictionlessSignup
}

},{"./Api":2,"./Display":3,"./Helper":5,"./Mapper":6}],5:[function(require,module,exports){
var Helper = function () {

}

Helper.prototype.checkEmail = function (email) {

	var pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

	return pattern.test(email);
}

Helper.prototype.objectByString = function (object, string) {
	try {
		string = string.replace(/\[(\w+)\]/g, '.$1');
		string = string.replace(/^\./, '');

		var attribute = string.split('.');

		for (var i = 0, n = attribute.length; i < n; ++i) {

			var k = attribute[i];

			if (k in object) {
				object = object[k];
			} else {
				return;
			}
		}

		return object;

	} catch (e) {
		return;
	}
}

module.exports = function () {
	return new Helper();
}

},{}],6:[function(require,module,exports){
var Helper = require('./Helper')

var Mapper = function () {
	this.helper = Helper()
}

Mapper.prototype.mapData = function (dataForm, dataApi) {
	var mappedData = {}

	for (var key in dataForm) {

		var sourceData = this.helper.objectByString(dataApi, key);

		mappedData[key] = (sourceData) ? sourceData : null;
	}
	return mappedData;
}

module.exports = function () {
	return new Mapper()
}

},{"./Helper":5}]},{},[1]);
