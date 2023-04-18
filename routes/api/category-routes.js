const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => { // find all categories
  try {
    const categoryData = await Category.findAll({
      include: [{ model: Product }],
    });
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.get('/:id', async (req, res) => { // find one category by its `id` value
  try {
    const categoryData = await Category.findByPk(req.params.id, {
      include: [{ model: Product }]
    });
    if (!categoryData) {
      res.status(404).json({ message: 'No category found with this id.'})
      return;
    }
    res.status(200).json(categoryData);
  } catch {
    res.status(500).json(err)
  }
});

router.post('/', async (req, res) => { // create a new category
  try {
    const categoryData = await Category.create(req.body);
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put('/:id', async (req, res) => { // update a category by its `id` value
  Category.update(req.body, { where: { id: req.params.id }, })
    .then((category) => {
      return CategoryTag.findAll({ where: { category_id: req.params.id } });
    })
    .then((categoryTags) => {
      const categoryTagIds = categoryTags.map(({ category_id }) => category_id); 
      const newCategoryTags = req.body.categoryIds
        .filter((category_id) => !categoryTagIds.includes(category_id))
        .map((category_id) => {
          return {
            product_id: req.params.id,
            category_id,
          };
        });
      const categoryTagsToRemove = categoryTags
        .filter(({category_id}) => !req.body.categoryIds.includes(category_id))
        .map(({id}) => id);
        return Promise.all([
          CategoryTag.destroy({ where: { id: categoryTagsToRemove} }),
          CategoryTag.bulkCreate(newCategoryTags),
        ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      res.status(400).json(err);
    });
});

router.delete('/:id', async (req, res) => { // delete a category by its `id` value
  try {
    const categoryData = await Category.destroy({
      where: { id: req.params.id }
    });
    if (!categoryData) {
      res.status(404).json({ message: 'No category found with this id.'})
      return;
    }
    res.status(200).json(categoryData);
  } catch {
    res.status(500).json(err);
  }
});

module.exports = router;