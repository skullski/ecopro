import { RequestHandler } from 'express';
import { getAllTemplates, getTemplate, getTemplatesByCategory as filterTemplatesByCategory } from '../data/templates';

export const getTemplates: RequestHandler = (req, res) => {
  try {
    const templates = getAllTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

export const getTemplateById: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const template = getTemplate(id);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Error fetching template', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
};

export const getTemplatesByCategory: RequestHandler = (req, res) => {
  try {
    const { category } = req.params;
    const templates = filterTemplatesByCategory(category);
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates by category', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};
