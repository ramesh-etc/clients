import React from 'react';
import { FormBuilder } from '../components/FormBuilder/FormBuilder';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

function FormBuilderPage() {
  return (
    <Sidebar>
      <FormBuilder />
    </Sidebar>
  )
}

export default FormBuilderPage
