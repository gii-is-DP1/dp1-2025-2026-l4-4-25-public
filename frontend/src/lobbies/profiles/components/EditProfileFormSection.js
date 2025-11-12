import React from 'react';
import FormGenerator from '../../../components/formGenerator/formGenerator';

const EditProfileFormSection = ({ 
  formInputs, 
  formRef, 
  onSubmit 
}) => {
  if (!formInputs || formInputs.length === 0) {
    return (
      <div className="edit-profile-right">
        <p>Loading form...</p>
      </div>
    );
  }

  return (
    <div className="edit-profile-right">
      <FormGenerator
        ref={formRef}
        inputs={formInputs}
        onSubmit={onSubmit}
        numberOfColumns={1}
        listenEnterKey
        buttonText="Save"
        buttonClassName="auth-button"
      />
    </div>
  );
};

export default EditProfileFormSection;
