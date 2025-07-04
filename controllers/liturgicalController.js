const Reflection = require('../models/reflections');

// Create a new reflection
exports.createReflection = async (req, res) => {
    try {
        const { description, hashtags, liturgicalInfo } = req.body;
        
        // Convert hashtags string to array of objects
        const hashtagArray = hashtags.split(/[\s,]+/)
            .filter(tag => tag.trim() !== '')
            .map(tag => ({ name: tag.trim() }));
        
        const newReflection = new Reflection({
            description,
            hashtags: hashtagArray,
            liturgicalInfo
        });

        await newReflection.save();
        res.redirect('/liturgicalCalendar');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Update a reflection
exports.updateReflection = async (req, res) => {
    try {
        const { id } = req.params;
        const { description, hashtags } = req.body;
        
        const hashtagArray = hashtags.split(/[\s,]+/)
            .filter(tag => tag.trim() !== '')
            .map(tag => ({ name: tag.trim() }));
        
        const updatedReflection = await Reflection.findByIdAndUpdate(
            id,
            { description, hashtags: hashtagArray },
            { new: true }
        );
        
        if (!updatedReflection) {
            return res.status(404).send('Reflection not found');
        }
        
        res.redirect('/liturgicalCalendar');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Delete a reflection
exports.deleteReflection = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedReflection = await Reflection.findByIdAndDelete(id);
        
        if (!deletedReflection) {
            return res.status(404).send('Reflection not found');
        }
        
        res.redirect('/liturgicalCalendar');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Get all reflections
exports.getAllReflections = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        // Get today's reflections
        const todaysReflections = await Reflection.find({
            createdAt: {
                $gte: today,
                $lt: tomorrow
            }
        }).sort({ createdAt: -1 });
        
        // Get previous reflections
        const previousReflections = await Reflection.find({
            createdAt: { $lt: today }
        }).sort({ createdAt: -1 }).limit(5);
        
        res.render('liturgicalCalendar', {
            reflections: todaysReflections,
            previousReflections
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Search reflections
exports.searchReflections = async (req, res) => {
    try {
        const { query } = req.query;
        const results = await Reflection.find(
            { $text: { $search: query } },
            { score: { $meta: "textScore" } }
        ).sort({ score: { $meta: "textScore" } });
        
        res.render('liturgicalCalendar', {
            reflections: [],
            previousReflections: results
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};