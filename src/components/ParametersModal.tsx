import React from 'react';
import { Dialog, DialogContent, Box } from '@mui/material';
import ParametersTable from './ParametersTable';

interface ParameterDetails {
  paramDefId: number;
  objectId: number;
  paramCaption: string;
  paramValue: string;
  isEditing?: boolean;
  tempValue?: string;
}

interface ParametersModalProps {
  open: boolean;
  onClose: () => void;
  onNewExpertise: (objectId: number) => void;
  searchObject: string;
  setSearchObject: React.Dispatch<React.SetStateAction<string>>;
  parametersData: ParameterDetails[];
  setParametersData: React.Dispatch<React.SetStateAction<ParameterDetails[]>>;
  selectedObjectId: number | null;
  setSelectedObjectId: React.Dispatch<React.SetStateAction<number | null>>;
  selectedCdeid: string | null;
}

const ParametersModal: React.FC<ParametersModalProps> = ({
  open,
  onClose,
  onNewExpertise,
  searchObject,
  setSearchObject,
  parametersData,
  setParametersData,
  selectedObjectId,
  setSelectedObjectId,
  selectedCdeid,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          margin: 0,
          width: { xs: '100%', md: '50%' },
          maxHeight: '100%',
          borderRadius: { xs: 0, md: '8px 0 0 8px' },
          zIndex: 1300,
        },
      }}
    >
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          <ParametersTable
            onNewExpertise={onNewExpertise}
            searchObject={searchObject}
            setSearchObject={setSearchObject}
            parametersData={parametersData}
            setParametersData={setParametersData}
            selectedObjectId={selectedObjectId}
            setSelectedObjectId={setSelectedObjectId}
            selectedCdeid={selectedCdeid}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ParametersModal;