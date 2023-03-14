<script setup lang="ts">
import { MButton } from 'meri-plus'
import { ElColorPicker } from 'element-plus'
import { Pagination as APagination } from 'ant-design-vue'
import { Progress as VProgress, Skeleton as VanSkeleton, Circle as VanCircle } from 'vant'
import { ref } from 'vue'

let current = 12
const color = ref('rgba(19, 206, 102, 0.8)')
</script>

<template>
    <div class="root">
        <div class="block">
            <h1>meri-design</h1>
            <div class="components">
                <MButton>awefwe</MButton>
            </div>
        </div>

        <div class="block">
            <h1>element-ui</h1>
            <div class="components">
                <el-color-picker v-model="color" show-alpha />
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
