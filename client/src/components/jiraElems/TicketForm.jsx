import { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function TicketForm({ show, handleClose }) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    summary: '',
    priority: t('jForm.priority.medium'),
    collection: '',
    description: '',
    link: window.location.href
  });
  const [error, setError] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [issueLink, setIssueLink] = useState('');
  const [userNew, setUserNew] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
      link: window.location.href
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const prodUrl = import.meta.env.VITE_PRODUCTION_URL;
    const token = localStorage.getItem('auth');

    if (!formData.summary.trim()) {
      setError('jForm.required_summary');
      return;
    }
    if (!formData.priority) {
      setError('jForm.required_priority');
      return;
    }

    setError('');

    try {
      const response = await fetch(`${prodUrl}/api/create-ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          summary: formData.summary.trim(),
          collection: formData.collection?.trim(),
          description: formData.description?.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setUserNew(data.userNew ? true : false);
        setIssueLink(data.issueLink || '');
        setShowAlert(true);
        setFormData((prevData) => {
          return {
            ...prevData,
            summary: '',
            priority: t('jForm.priority.medium'),
            collection: '',
            description: '',
            link: window.location.href
          };
        });
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop='static'
      className='modal-fullscreen-sm-down'
    >
      <Modal.Header closeButton>
        <Modal.Title>{t('jForm.heading')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form className='fs-5'>
          <Form.Group controlId='summary' className='mb-3'>
            <Form.Label>{t('jForm.summaryLabel')}</Form.Label>
            <Form.Control
              as='textarea'
              rows={3}
              name='summary'
              value={formData.summary}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId='description' className='mb-3'>
            <Form.Label>{t('jForm.descriptionLabel')}</Form.Label>
            <Form.Control
              as='textarea'
              rows={3}
              name='description'
              value={formData.description}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId='priority' className='mb-3'>
            <Form.Label>{t('jForm.priorityLabel')}</Form.Label>
            <Form.Control
              as='select'
              name='priority'
              value={formData.priority}
              onChange={handleChange}
              required
            >
              <option value='Highest'>{t('jForm.priority.highest')}</option>
              <option value='High'>{t('jForm.priority.high')}</option>
              <option value='Medium'>{t('jForm.priority.medium')}</option>
              <option value='Low'>{t('jForm.priority.low')}</option>
              <option value='Lowest'>{t('jForm.priority.lowest')}</option>
            </Form.Control>
          </Form.Group>

          <Form.Group controlId='collection' className='mb-4'>
            <Form.Label>{t('jForm.collectionLabel')}</Form.Label>
            <Form.Control
              type='text'
              name='collection'
              value={formData.collection}
              onChange={handleChange}
            />
          </Form.Group>

          {showAlert && (
            <Alert
              variant='info'
              onClose={() => setShowAlert(false)}
              dismissible
            >
              {t('jForm.successMsg')}
              <Link to={`${issueLink || '/'}`} className='text-decoration-none'>
                {t('jForm.successLink')}
              </Link>
              .
              {userNew && (
                <>
                  <hr />
                  <p>{t('jForm.newAccount')}</p>
                </>
              )}
            </Alert>
          )}

          {error && (
            <p className='text-danger mt-1'>
              {t(error, { defaultValue: t('error.default') })}
            </p>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={handleClose}>
          Close
        </Button>
        <Button variant='primary' type='submit' onClick={handleSubmit}>
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
