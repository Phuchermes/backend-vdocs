module.exports = async (req, res) => {
    const { name } = req.body;
    res.json({ message: `Hello ${name}, this is your function!` });
};
