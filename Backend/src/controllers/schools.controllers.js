import pool from "../db/index.js";

const validateSchoolData = (name, address, latitude, longitude) => {
    if (!name || typeof name !== 'string' || name.trim() === '') {
        return 'Invalid name';
    }
    if (!address || typeof address !== 'string' || address.trim() === '') {
        return 'Invalid address';
    }
    if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
        return 'Invalid latitude';
    }
    if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
        return 'Invalid longitude';
    }
    return null; // Valid input
};

const addSchool = async (req, res) => {
    const { name, address, latitude, longitude } = req.body;
    const validationError = validateSchoolData(name, address, latitude, longitude);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }
    const [existingSchools] = await pool.query(
        'SELECT * FROM schools WHERE latitude = ? AND longitude = ?',
        [latitude, longitude]
    );
    if (existingSchools.length > 0) {
        return res.status(409).json({ error: 'A school already exists at the specified location' });
    }
    try {
        const [result] = await pool.query(
            'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
            [name, address, latitude, longitude]
        );
        const id = result.insertId;
        const addedSchool = await getSchoolById(id);
        if (!addedSchool) {
            return res.status(500).json({ error: "Failed to add school" });
        }
        return res.status(201).json(addedSchool);
    } catch (error) {
        console.error('Error adding school:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const getSchoolById = async (id) => {
    if (!id) return null;

    try {
        const [rows] = await pool.query('SELECT * FROM schools WHERE id = ?', [id]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Error fetching school:', error);
        return null;
    }
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRadians = degrees => degrees * (Math.PI / 180);
    const R = 6371; // Radius of the Earth in km

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in km
};

const listSchools = async (req, res) => {
    const { latitude, longitude } = req.query;

    if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ error: 'Invalid latitude or longitude' });
    }

    try {
        const [schools] = await pool.query('SELECT * FROM schools');
        const userLatitude = parseFloat(latitude);
        const userLongitude = parseFloat(longitude);

        const schoolsWithDistance = schools.map(school => ({
            ...school,
            distance: calculateDistance(userLatitude, userLongitude, school.latitude, school.longitude)
        }));

        schoolsWithDistance.sort((a, b) => a.distance - b.distance);

        return res.status(200).json(schoolsWithDistance);
    } catch (error) {
        console.error('Error fetching schools:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export { addSchool, listSchools };