export async function addSuscriber(req, res) {
    const { email } = req.body
    try {
        
    } catch (error) {
        console.log('UNABLE TO ADD SUSCRIPTION', error)
        res.status(500).json({ success: false, data: 'Unable to add subscription' })
    }
}