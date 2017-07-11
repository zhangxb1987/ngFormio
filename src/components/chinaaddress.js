var fs = require('fs');

module.exports = function(app) {
  app.directive('chinaAddressInput', function() {
    return {
      restrict: 'E',
      replace: true,
      require: 'ngModel',
      scope: {
        component: '=',
        componentId: '=',
        readOnly: '=',
        ngModel: '=',
        builder: '=?'
      },
      templateUrl: 'formio/components/china-address-input.html',
      controller: ['$scope', function($scope) {
        if ($scope.builder) return;
        $scope.provinces = [
          {value: '', label: $scope.component.fields.province.placeholder}
        ];
        $scope.cities = [
          {value: '', label: $scope.component.fields.city.placeholder}
        ];
        $scope.counties = [
          {value: '', label: $scope.component.fields.county.placeholder}
        ];

        $scope.date = {
          province: '',
          city: '',
          county: ''
        };
      }],
      link: function(scope, elem, attrs, ngModel) {
        if (scope.builder) return;
        // Set the scope values based on the current model.
        scope.$watch('ngModel', function() {
          // Only update on load.
          if (ngModel.$viewValue && !ngModel.$dirty) {
            var parts = typeof ngModel.$viewValue === 'string'
              ? ngModel.$viewValue.split('/')
              : ngModel.$viewValue;
            if ((parts instanceof Array) && parts.length === 3) {
              scope.date.day = parts[(scope.component.dayFirst ? 0 : 1)];
              scope.date.month = parts[(scope.component.dayFirst ? 1 : 0)];
              scope.date.year = parts[2];
            }
          }
        });

        var padLeft = function padLeft(nr, n, str) {
          nr = nr.toString();
          if (nr.length > n) {
            return nr.substr(0, n);
          }

          return Array((n - nr.length) + 1).join(str || '0') + nr;
        };

        scope.onChange = function() {
          var day = padLeft(scope.date.day, 2);
          var month = padLeft(scope.date.month, 2);
          var year = padLeft(scope.date.year, 4);
          var value = scope.component.dayFirst ? day : month;
          value += '/';
          value += scope.component.dayFirst ? month : day;
          value += '/' + year;
          ngModel.$setViewValue(value);
        };

        ngModel.$validators.day = function(modelValue, viewValue) {
          var value = modelValue || viewValue;
          var required = scope.component.fields.day.required || scope.component.fields.month.required || scope.component.fields.year.required;

          if (!required) {
            return true;
          }
          if (!value && required) {
            return false;
          }
          var parts = value.split('/');
          if (scope.component.fields.day.required) {
            if (parts[(scope.component.dayFirst ? 0 : 1)] === '00') {
              return false;
            }
          }
          if (scope.component.fields.month.required) {
            if (parts[(scope.component.dayFirst ? 1 : 0)] === '00') {
              return false;
            }
          }
          if (scope.component.fields.year.required) {
            if (parts[2] === '0000') {
              return false;
            }
          }
          return true;
        };
      }
    };
  });

  app.config([
    'formioComponentsProvider',
    function(formioComponentsProvider) {
      formioComponentsProvider.register('chinaaddress', {
        title: 'China Address',
        template: 'formio/components/china-address.html',
        controller: ['$scope', '$http', function($scope) {
          if ($scope.builder) return;
          $scope.address = {};
          $scope.addresses = [];
          $scope.refreshAddress = function(address) {
            if (!address) {
              return;
            }
          };
        }],
        tableView: function(data) {
          return data ? data.formatted_address : '';
        },
        group: 'advanced',
        settings: {
          input: true,
          tableView: true,
          label: '',
          key: 'chinaAddressField',
          fields: {
            province: {
              type: 'select',
              placeholder: '',
              required: false
            },
            city: {
              type: 'select',
              placeholder: '',
              required: false
            },
            county: {
              type: 'select',
              placeholder: '',
              required: false
            }
          },
          multiple: false,
          protected: false,
          clearOnHide: true,
          unique: false,
          persistent: true,
          hidden: false,
          validate: {
            required: false
          }
        }
      });
    }
  ]);
  app.run([
    '$templateCache',
    function($templateCache) {
      $templateCache.put('formio/components/china-address.html',
        fs.readFileSync(__dirname + '/../templates/components/china-address.html', 'utf8')
      );
    }
  ]);
};
