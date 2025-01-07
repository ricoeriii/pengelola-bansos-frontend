import { useEffect, useState } from 'react';
import axios from 'axios';
import { Form, Input, Select, Button, DatePicker, Upload, message, UploadFile } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';

interface Program {
  id: number;
  name: string;
}

interface ReportData {
  programId: number;
  recipientCount: string;
  region: string;
  distributionDate: string;
  note: string;
  proof?: string;
  program: Program;
}

const FormEditReport = () => {
  const [form] = Form.useForm();
  const [file, setFile] = useState<File | null>(null);
  const [initialValues, setInitialValues] = useState<ReportData | null>(null);
  const id = useParams().id as string;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        console.log('Fetching report with ID:', id);
        const response = await axios.get(`http://localhost:3000/api/reports/${id}`);
        console.log('Fetched report data:', response.data);
        setInitialValues({
          ...response.data,
          distributionDate: moment(response.data.distributionDate),
        });
      } catch (error) {
        console.error('Error fetching report:', error);
        message.error('Gagal memuat laporan.');
      }
    };

    if (id) {
      fetchReport();
    }
  }, [id]);

  const handleFileChange = (info: { file: UploadFile<unknown> }) => {
    setFile(info.file.originFileObj as File);
    console.log('Selected File:', info.file);
  };

  const onFinish = async (values: { [key: string]: unknown }) => {
    if (!file && (!initialValues || !initialValues.proof)) {
      console.error('No file selected');
      message.error('Harap unggah bukti penyaluran!');
      return;
    }

    const formData = new FormData();
    formData.append('programId', values.programId as string);
    formData.append('recipientCount', values.recipientCount as string);
    formData.append('region', values.region as string);
    formData.append('distributionDate', (values.distributionDate as moment.Moment).format('YYYY-MM-DD'));
    formData.append('note', values.note as string);
    if (file) {
      formData.append('proof', file);
    }

    try {
      await axios.put(`http://localhost:3000/api/reports/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      message.success('Laporan berhasil diperbarui!');
      navigate('/reports');
    } catch (error) {
      console.error('Error:', error);
      message.error('Terjadi kesalahan saat mengirim laporan.');
    }
    navigate('/reports')
  };

  if (!initialValues) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">Edit Laporan Penyaluran</h2>
      <Form form={form} onFinish={onFinish} layout="vertical" initialValues={initialValues}>
        <Form.Item label="Nama Program" name="programId" rules={[{ required: true, message: 'Wajib diisi' }]}>
          <Select placeholder="Pilih Program" className="border-gray-300 rounded-lg">
            <Select.Option value={1}>PKH</Select.Option>
            <Select.Option value={2}>BLT</Select.Option>
            <Select.Option value={3}>Bansos</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Jumlah Penerima" name="recipientCount" rules={[{ required: true, message: 'Wajib diisi' }]}>
          <Input type="number" className="border-gray-300 rounded-lg" />
        </Form.Item>

        <Form.Item label="Wilayah" name="region" rules={[{ required: true, message: 'Wajib diisi' }]}>
          <Input placeholder="Provinsi, Kabupaten, Kecamatan" className="border-gray-300 rounded-lg" />
        </Form.Item>

        <Form.Item label="Tanggal Penyaluran" name="distributionDate" rules={[{ required: true, message: 'Wajib diisi' }]}>
          <DatePicker className="border-gray-300 rounded-lg w-full" />
        </Form.Item>

        <Form.Item label="Bukti Penyaluran" rules={[{ required: true }]}>
          <Upload
            beforeUpload={() => false}
            onChange={handleFileChange}
            accept=".jpg,.png,.pdf"
            customRequest={({ file }) => {
              setFile(file as File);
            }}
            className="border-gray-300 rounded-lg"
            fileList={initialValues.proof ? [{ uid: '-1', name: initialValues.proof, url: `http://localhost:3000${initialValues.proof}` }] : []}
          >
            <Button icon={<UploadOutlined />} className="bg-blue-500 text-white hover:bg-blue-600 rounded-lg">
              Unggah File
            </Button>
          </Upload>
        </Form.Item>

        <Form.Item label="Catatan Tambahan" name="note">
          <Input.TextArea rows={3} className="border-gray-300 rounded-lg" />
        </Form.Item>

        <div className="text-center mt-6">
          <Button type="primary" htmlType="submit" className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
            Perbarui
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default FormEditReport;
