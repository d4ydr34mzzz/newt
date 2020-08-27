const moment = require('moment');

module.exports = {
    formatDate: function (date, format) {
        return moment(date).format(format);
    },
    // Reference: https://stackoverflow.com/questions/13046401/how-to-set-selected-select-option-in-handlebars-template
    //            https://handlebarsjs.com/guide/block-helpers.html#basic-blocks
    //            https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
    select: function (select, options) {
        const pattern = new RegExp('value=["\']' + select + '["\']');
        return options.fn(this).replace(pattern, '$& selected');
    },
    displayStoryOptions: function (storyUser, loggedInUser) {
        if(storyUser == null){
            return false;
        }
        
        if (String(storyUser) == String(loggedInUser)) {
            return true;
        } else {
            return false;
        }
    }
}