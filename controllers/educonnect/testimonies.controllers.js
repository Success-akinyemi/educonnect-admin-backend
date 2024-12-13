export async function newTestimonials(req, res) {
    try {
        
    } catch (error) {
        console.log('')
        res.status(500).json({ success: false, data: ' ' })
    }
}

export async function getAllTestimonies(req, res) {
    try {
        
    } catch (error) {
        console.log('UNABLE TO GET ALL TESTIMONIALS (EDUCONNECT)', error)
        res.status(500).json({ success: false, data: 'Unable to get all testimomials' })
    }
}

export async function getATestimonies(req, res) {
    const { id } = req.params
    try {
        
    } catch (error) {
        console.log('UNABLE TO GET TESTIMONIY', error)
        res.status(500).json({ success: false, data: 'Unable to get testimony' })
    }
}