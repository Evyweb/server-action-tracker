describe('index', () => {
    it('should list all files containing server actions', async () => {
        // Arrange
        vi.spyOn(console, 'log').mockImplementationOnce(() => {});
        vi.spyOn(console, 'table').mockImplementationOnce(() => {});

        // Act
        await import('../../src/index');

        // Assert
        expect(console.log).toHaveBeenCalledWith('Server actions found:');
        expect(console.table).toHaveBeenCalledWith([
            {fileName: '@/serverActions/firstServerAction.ts', functionName: 'firstServerAction'},
            {fileName: '@/serverActions/secondServerAction.ts', functionName: 'secondServerAction'},
            {fileName: '@/serverActions/thirdServerAction.tsx', functionName: 'thirdServerAction'},
        ]);
    });
});