<script setup lang="ts">
import { Button, Pagination } from 'meri-design'
import { Progress as ElProgress, Button as ElButton, Icon } from 'element-ui'
import { Pagination as APagination } from 'ant-design-vue'
import { Progress as VProgress, Skeleton as VanSkeleton, Circle as VanCircle } from 'vant'
import 'vant/lib/index.css'
let current = 10
</script>

<template>
    <div class="root">
        <div class="block">
            <h1>meri-design</h1>
            <div class="components">
                <Button>awefwe</Button>
                <Pagination :pageCount="1500" />
            </div>
        </div>

        <div class="block">
            <h1>element-ui</h1>
            <div class="components">
                <Icon />
                <ElButton>ajhajiw</ElButton>
                <ElProgress :percentage="100" status="success" style="width: 200px" />
            </div>
        </div>
        <div class="block">
            <h1>ant-design-vue</h1>
            <div class="components">
                <a-pagination v-model="current" :total="50" show-less-items />
            </div>
        </div>

        <div class="block">
            <h1>vant</h1>
            <div class="components">
                <VProgress :percentage="50" style="width: 200px" />
                <van-skeleton title avatar :row="3" style="width: 200px" />
                <VanCircle
                    :current-rate="510"
                    :rate="100"
                    :speed="1"
                    text="hahaha"
                    style="width: 200px; height: 200px; border: 1px solid red"
                />
            </div>
        </div>
    </div>
</template>

<style scoped>
.root {
    display: flex;
    flex-flow: column nowrap;
}
.block {
    width: 100vw;
    border: 1px solid red;
}

.components {
    height: 100px;
    display: flex;
}
</style>
