import { Card, CardHeader } from '../../components/ui/Card';

interface KaggleDataset {
  name: string;
  description: string;
  url: string;
  rows: string;
  features: string[];
  usedFor: string;
}

const datasets: KaggleDataset[] = [
  {
    name: 'IoT Sensor Data – Temperature & Humidity',
    description:
      'Tập dữ liệu cảm biến IoT ghi lại nhiệt độ và độ ẩm trong các môi trường thực tế, được thu thập từ nhiều loại cảm biến DHT22 và DS18B20.',
    url: 'https://www.kaggle.com/datasets/garystafford/environmental-sensor-data',
    rows: '~1.5 triệu mẫu',
    features: ['temperature', 'humidity', 'timestamp', 'device_id'],
    usedFor: 'Huấn luyện mô hình dự đoán ngưỡng và phát hiện bất thường',
  },
  {
    name: 'Smart Building Occupancy Detection',
    description:
      'Dữ liệu cảm biến trong toà nhà thông minh bao gồm nhiệt độ, độ ẩm, ánh sáng và CO2 để phát hiện sự hiện diện của người.',
    url: 'https://www.kaggle.com/datasets/kukuroo3/room-occupancy-detection-data-iot-sensor',
    rows: '~20.000 mẫu',
    features: ['Temperature', 'Humidity', 'Light', 'CO2', 'HumidityRatio', 'Occupancy'],
    usedFor: 'Phát hiện phòng học có người để tối ưu hoá điều khiển thiết bị',
  },
  {
    name: 'Classroom Climate Dataset',
    description:
      'Bộ dữ liệu khí hậu phòng học ghi nhận nhiệt độ và độ ẩm theo thời gian thực, phù hợp để xây dựng mô hình dự đoán và cảnh báo sớm.',
    url: 'https://www.kaggle.com/datasets',
    rows: '~500.000 mẫu',
    features: ['room_id', 'temp_celsius', 'humidity_pct', 'timestamp', 'label'],
    usedFor: 'Dự đoán xu hướng nhiệt độ và cảnh báo vượt ngưỡng trước 15 phút',
  },
];

const mlPipeline = [
  {
    step: '1',
    title: 'Thu thập dữ liệu',
    description:
      'Tải dataset từ Kaggle bằng Kaggle API (kaggle datasets download). Dữ liệu bao gồm chuỗi thời gian nhiệt độ và độ ẩm từ cảm biến IoT.',
    icon: '📥',
  },
  {
    step: '2',
    title: 'Tiền xử lý',
    description:
      'Làm sạch dữ liệu, xử lý giá trị thiếu, chuẩn hoá nhiệt độ và độ ẩm. Tạo các feature cửa sổ thời gian (rolling mean, lag features).',
    icon: '🔧',
  },
  {
    step: '3',
    title: 'Huấn luyện mô hình',
    description:
      'Sử dụng Kaggle Notebooks để huấn luyện mô hình LSTM hoặc Random Forest dự đoán nhiệt độ 15 phút tới và phát hiện bất thường.',
    icon: '🤖',
  },
  {
    step: '4',
    title: 'Triển khai',
    description:
      'Xuất mô hình dưới dạng ONNX hoặc TensorFlow Lite, tích hợp vào backend để phân tích dữ liệu thực tế từ phòng học.',
    icon: '🚀',
  },
];

export function KagglePage() {
  return (
    <div className="space-y-6">
      {/* Hero section */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="flex items-start gap-4">
          <span className="text-5xl">📊</span>
          <div>
            <h1 className="text-2xl font-bold mb-2">Kaggle trong Smart Classroom</h1>
            <p className="text-blue-100 text-sm leading-relaxed">
              Kaggle là nền tảng khoa học dữ liệu hàng đầu thế giới với hàng nghìn dataset miễn phí
              và môi trường notebook để huấn luyện mô hình Machine Learning. Trong hệ thống quản lý
              phòng học thông minh này, Kaggle được sử dụng để xây dựng các mô hình AI dự đoán
              nhiệt độ, độ ẩm và phát hiện bất thường.
            </p>
          </div>
        </div>
      </Card>

      {/* Why Kaggle */}
      <Card>
        <CardHeader title="Tại sao dùng Kaggle?" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: '🗄️',
              title: 'Datasets phong phú',
              desc: 'Hàng nghìn dataset IoT, cảm biến môi trường miễn phí, sẵn sàng để tải xuống và sử dụng.',
            },
            {
              icon: '💻',
              title: 'Notebook miễn phí',
              desc: 'Kaggle Notebooks cung cấp GPU/TPU miễn phí để huấn luyện mô hình ML mà không cần hạ tầng riêng.',
            },
            {
              icon: '🏆',
              title: 'Cộng đồng & Benchmarks',
              desc: 'So sánh hiệu quả mô hình với cộng đồng toàn cầu, tìm giải pháp tối ưu cho bài toán.',
            },
          ].map((item) => (
            <div key={item.title} className="bg-gray-50 rounded-lg p-4">
              <span className="text-2xl">{item.icon}</span>
              <h3 className="font-semibold text-gray-800 mt-2">{item.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* ML Pipeline */}
      <Card>
        <CardHeader title="Quy trình ML với Kaggle" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mlPipeline.map((step) => (
            <div key={step.step} className="text-center p-4 border border-gray-200 rounded-lg">
              <span className="text-3xl">{step.icon}</span>
              <div className="mt-2">
                <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                  Bước {step.step}
                </span>
                <h3 className="font-semibold text-gray-800 mt-2 mb-1">{step.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Datasets */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Datasets đang sử dụng</h2>
        <div className="space-y-4">
          {datasets.map((ds) => (
            <Card key={ds.name}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{ds.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{ds.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                      📦 {ds.rows}
                    </span>
                    {ds.features.map((f) => (
                      <span
                        key={f}
                        className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-green-700 font-medium mt-3">
                    ✅ Dùng để: {ds.usedFor}
                  </p>
                </div>
                <a
                  href={ds.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Xem dataset →
                </a>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Kaggle CLI */}
      <Card>
        <CardHeader title="Cách tải dataset bằng Kaggle CLI" />
        <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm space-y-2">
          <p>
            <span className="text-gray-500"># Cài đặt Kaggle CLI</span>
          </p>
          <p>pip install kaggle</p>
          <p className="mt-2">
            <span className="text-gray-500"># Đặt API key (tải từ kaggle.com/settings)</span>
          </p>
          <p>{'export KAGGLE_USERNAME=your_username'}</p>
          <p>{'export KAGGLE_KEY=your_api_key'}</p>
          <p className="mt-2">
            <span className="text-gray-500"># Tải dataset về</span>
          </p>
          <p>kaggle datasets download garystafford/environmental-sensor-data</p>
          <p className="mt-2">
            <span className="text-gray-500"># Giải nén</span>
          </p>
          <p>unzip environmental-sensor-data.zip -d data/</p>
        </div>
      </Card>
    </div>
  );
}
