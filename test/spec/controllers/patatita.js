'use strict';

describe('Controller: PatatitaCtrl', function () {

  // load the controller's module
  beforeEach(module('yeomanApp'));

  var PatatitaCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PatatitaCtrl = $controller('PatatitaCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
