/**
 * Created by lalit on 7/9/17.
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var StorySchema = ({

    creator : { type: Schema.Types.ObjectId, ref: 'User' },
    content: String,
    created: { type: Date, default: Date.now() }

});

module.exports = mongoose.model('Story', StorySchema);
