import FaqModel from "../../models/educonnect/Faq.js"

export async function newFaq(req, res) {
    const { question, answer} = req.body
    if(!question || !answer)
        return res.status(400).json({ success: false, data: 'Provide question and answer' })
    try {
        const data = { question, answer }

        const faqExist = await FaqModel.findOne()
        if(faqExist){
            faqExist.faqs.push(data)
            await faqExist.save()
        }

        const createFaq = await FaqModel.create({
            faqs: data
        }) 

        res.status(201).json({ success: true, data: 'Faq created successful' })
    } catch (error) {
        console.log('UNABLE TO CREATE NEW FAQ (EDUCONNECT)', error)
        res.status(500).json({ success: false, data: 'Unable to create new FAQ' })
    }
}

export async function updateFaq(req, res) {
    const { id, question, answer } = req.body;

    if (!id || !question || !answer) {
        return res.status(400).json({ success: false, data: 'ID, question, and answer are required' });
    }

    try {
        const updatedFaq = await FaqModel.findOneAndUpdate(
            { 'faqs._id': id }, 
            { 
                $set: { 
                    'faqs.$.question': question, 
                    'faqs.$.answer': answer 
                } 
            }, 
            { new: true } 
        );

        if (!updatedFaq) {
            return res.status(404).json({ success: false, data: 'FAQ not found' });
        }

        res.status(200).json({ success: true, data: 'FAQ updated successfully', updatedFaq });
    } catch (error) {
        console.error('UNABLE TO UPDATE FAQ', error);
        res.status(500).json({ success: false, data: 'Unable to update FAQ data' });
    }
}

export async function toggleFaqActive(req, res) {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ success: false, data: 'ID is required' });
    }

    try {
        const faqDocument = await FaqModel.findOne({ 'faqs._id': id }, { 'faqs.$': 1 });
        
        if (!faqDocument || !faqDocument.faqs || !faqDocument.faqs.length) {
            return res.status(404).json({ success: false, data: 'FAQ not found' });
        }

        const currentActiveState = faqDocument.faqs[0].active;

        const updatedFaq = await FaqModel.findOneAndUpdate(
            { 'faqs._id': id },
            {
                $set: {
                    'faqs.$.active': !currentActiveState, 
                },
            },
            { new: true }
        );

        if (!updatedFaq) {
            return res.status(404).json({ success: false, data: 'FAQ not found' });
        }

        res.status(200).json({ success: true, data: 'FAQ active status toggled successfully' });
    } catch (error) {
        console.error('UNABLE TO UPDATE FAQ', error);
        res.status(500).json({ success: false, data: 'Unable to update FAQ data' });
    }
}

export async function getAllFaq(req, res) {
    try {
        const faqData = await FaqModel.find()

        res.status(200).json({ success: true, data: faqData })
    } catch (error) {
        console.log('UNABLE TO GET FAQS', error)
        res.status(500).json({ success: false, data: 'Unable to get faq data' })
    }
}

export async function getFaqs(req, res) {
    try {
        const faqData = await FaqModel.find()

        res.status(200).json({ success: true, data: faqData })
    } catch (error) {
        console.log('UNABLE TO GET FAQS', error)
        res.status(500).json({ success: false, data: 'Unable to get faq data' })
    }
}

export async function deleteFaq(req, res) {
    const { id } = req.body;

    try {
        const faqData = await FaqModel.findOneAndUpdate(
            { 'faqs._id': id }, 
            { $pull: { faqs: { _id: id } } }, 
            { new: true } 
        );

        if (!faqData) {
            return res.status(404).json({ success: false, data: 'FAQ data not found' });
        }

        return res.status(200).json({ success: true, data: 'FAQ data deleted successfully' });
    } catch (error) {
        console.error('UNABLE TO DELETE FAQ', error);
        return res.status(500).json({ success: false, data: 'Unable to delete FAQ' });
    }
}

export async function getFaq(req, res) {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ success: false, data: 'Provide an ID' });
    }


    try {
        let faqData = {}
        if(mongoose.Types.ObjectId.isValid(id)){
            faqData = await FaqModel.findOne({ 'faqs._id': id }, { 'faqs.$': 1 });
        }

        if (!faqData || !faqData.faqs || faqData.faqs.length === 0) {
            return res.status(404).json({ success: false, data: 'FAQ not found' });
        }

        res.status(200).json({ success: true, data: faqData.faqs[0] });
    } catch (error) {
        console.error('UNABLE TO GET FAQ', error);
        res.status(500).json({ success: false, data: 'Unable to get FAQ data' });
    }
}
