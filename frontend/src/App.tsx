import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { Shell } from './components/layout/Shell'
import { HomePage } from './pages/HomePage'
import { PageView } from './pages/PageView'
import { TopicView } from './pages/TopicView'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Shell />}>
          <Route index element={<HomePage />} />
          <Route path="topic/:topicId" element={<TopicView />} />
          <Route path="page/:pageId" element={<PageView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
