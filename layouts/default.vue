<template>
    <div class="layout-wrapper">
        <header>Header</header>
        <main>
            <slot></slot>
        </main>
        <footer>Footer</footer>
    </div>
</template>
<style lang="scss">
.layout-wrapper {
    box-shadow: 0 0 5px 1px lightcoral;
    display: flex;
    flex-direction: column;
    max-width: 1280px;
    min-height: 100svh;
    margin: 0 auto;
    background-color: lightgray;

    >header,
    >footer {
        display: flex;
        height: 3.5rem;
        align-items: center;
        justify-content: center;
        
    }

    >main {}

    >footer {
        margin-top: auto;
    }
}
</style>