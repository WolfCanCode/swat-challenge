import React, { useEffect, useState } from 'react'
import { createApi } from 'unsplash-js'
import { useHistory, useLocation } from 'react-router-dom'
import _ from 'lodash'

import './App.css'
import { Col, Empty, Pagination, Row, Space, Spin } from 'antd'

function App() {
  const history = useHistory()

  const [search, setSearch] = useState(useQuery().get('search') || '')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(parseInt(useQuery().get('page')) || 1)
  const [loading, setLoading] = useState(false)
  const [imageList, setImageList] = useState([])

  const unsplash = createApi({
    accessKey: import.meta.env.VITE_UNS_KEY,
    headers: { 'X-Custom-Header': 'foo' },
  })

  useEffect(() => {
    //run when load page
    window.document.getElementById('search').value = search
    doSearch(search)
  }, [])

  useEffect(() => {
    doSearch(search)
  }, [page])

  function useQuery() {
    return new URLSearchParams(useLocation().search)
  }

  const doSearch = async (searchValue) => {
    setLoading(true)
    if (searchValue !== search) {
      setPage(1)
    }
    setSearch(searchValue)
    history.push(`?search=${searchValue}&page=${page}`)
    if (searchValue) {
      await unsplash.search
        .getPhotos({
          query: searchValue,
          page: page,
          perPage: 8,
        })
        .then((data) => {
          setLoading(false)
          let response = data.response
          setTotal(response.total)
          setImageList(
            response.results.map((result) => ({
              name: result.user.name,
              bio: result.user.bio,
              thumb: result.urls.thumb,
              link: result.links.html,
            })),
          )
        })
    }
  }

  return (
    <div className="App">
      <div className={'bg-container'}>
        <h1>SWAT Challenge</h1>
        <div className={'search-bar-container'}>
          <Row>
            <Col xs={{ span: 18, offset: 3 }} lg={{ span: 8, offset: 8 }}>
              <div className={'search-bar'}>
                <input
                  id={'search'}
                  placeholder={'Type something to search for image'}
                  className={'search-input'}
                  onChange={_.debounce((e) => doSearch(e.target.value), 800)}
                />
              </div>
            </Col>
          </Row>
        </div>
      </div>
      <Space id={'image-list'} direction="vertical" className={'img-list-container'}>
        <Spin spinning={loading && search}>
          <Row gutter={16}>
            {search && imageList && imageList.length ? (
              imageList.map((imgItem) => (
                <Col key={imgItem.link} xs={{ span: 12 }} lg={{ span: 6 }}>
                  <div
                    className={'img-item'}
                    style={{
                      backgroundImage: `linear-gradient(to bottom,rgba(0,0,0,0),rgba(0,0,0,.4)),url('${imgItem.thumb}')`,
                    }}
                    onClick={() => window.open(imgItem.link)}
                  >
                    <div className={'img-info'}>
                      <p>{imgItem.name}</p>
                      <p>{imgItem.bio || '...'}</p>
                    </div>
                  </div>
                </Col>
              ))
            ) : (
              <div className={'empty-container'}>
                <Empty />
              </div>
            )}
          </Row>
        </Spin>
        {search && total !== 0 ? (
          <Pagination
            onChange={(page) => {
              window.document.getElementById('image-list').scrollTop = 0
              setPage(page)
            }}
            current={page || 1}
            className={'pagination'}
            defaultCurrent={8}
            total={total}
            showSizeChanger={false}
            responsive
          />
        ) : (
          ''
        )}
      </Space>
    </div>
  )
}

export default App
