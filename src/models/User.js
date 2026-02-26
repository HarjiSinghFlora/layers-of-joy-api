const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    full_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'staff'], default: 'staff' }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// ✅ Use a regular function (not arrow) with callbacks – avoids async issues
userSchema.pre('save', function(next) {
    if (!this.isModified('password_hash')) return next();

    bcrypt.genSalt(10, (err, salt) => {
        if (err) return next(err);
        bcrypt.hash(this.password_hash, salt, (err, hash) => {
            if (err) return next(err);
            this.password_hash = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password_hash);
};

module.exports = mongoose.model('User', userSchema);
